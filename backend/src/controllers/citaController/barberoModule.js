// src/controllers/citaController/barberoModule.js
import barberoCitaService from "../../services/barberoCitaService.js";
import citaRepository from "../../repositories/citaRepository.js";
import { userRepository } from "../../repositories/userRepository.js";
import { getPool } from "../../config/db.js";
import {
  ok,
  badRequest,
  forbidden,
  notFound,
} from "../../utils/responseUtils.js";

export const getAgendaDia = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const barberoId =
      req.usuario.rol === "admin" && req.query.barbero_id
        ? req.query.barbero_id
        : req.usuario.id;

    const agenda = await barberoCitaService.getAgendaDia(
      barberoId,
      fecha,
      req.usuario.id,
      req.usuario.rol,
    );

    return ok(res, agenda);
  } catch (error) {
    next(error);
  }
};

export const getAgendaSemana = async (req, res, next) => {
  try {
    const { id: barberoId } = req.params;
    const fechaInicio =
      req.query.fecha_inicio || new Date().toISOString().split("T")[0];

    const agenda = await barberoCitaService.getAgendaSemana(
      barberoId,
      fechaInicio,
      req.usuario.id,
      req.usuario.rol,
    );

    return ok(res, agenda);
  } catch (error) {
    next(error);
  }
};

export const confirmarCita = async (req, res, next) => {
  try {
    const cita = await barberoCitaService.confirmar(
      req.params.id,
      req.usuario.id,
    );
    return ok(res, { message: "Cita confirmada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const finalizarCita = async (req, res, next) => {
  try {
    const cita = await barberoCitaService.finalizar(
      req.params.id,
      req.usuario.id,
    );
    return ok(res, { message: "Cita finalizada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const actualizarEstadoCita = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = [
      "pendiente",
      "confirmada",
      "completada",
      "cancelada",
    ];

    if (!estado || !estadosValidos.includes(estado)) {
      return badRequest(
        res,
        `Estado inválido. Estados permitidos: ${estadosValidos.join(", ")}`,
      );
    }

    const cita = await citaRepository.updateEstado(req.params.id, estado);

    if (!cita) {
      return notFound(res, "Cita no encontrada");
    }

    return ok(res, { message: "Estado actualizado exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const getCitasBarbero = async (req, res, next) => {
  try {
    const { barbero_id } = req.params;
    const { fecha, estado, limit = 100 } = req.query;

    if (
      req.usuario.rol === "barbero" &&
      parseInt(barbero_id) !== req.usuario.id
    ) {
      return forbidden(res, "No tienes permiso para ver citas de otro barbero");
    }

    const barbero = await userRepository.findById(barbero_id);
    if (!barbero || barbero.rol !== "barbero") {
      return notFound(res, "Barbero no encontrado");
    }

    const pool = getPool();

    const [estadisticas] = await pool.execute(
      `SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        COALESCE(SUM(CASE WHEN c.estado = 'completada' THEN s.precio ELSE 0 END), 0) as ingresos_totales
      FROM citas c
      INNER JOIN servicios s ON c.servicio_id = s.id
      WHERE c.barbero_id = ?`,
      [barbero_id],
    );

    const [resumenRows] = await pool.execute(
      `SELECT 
        estado, 
        COUNT(*) as total,
        COALESCE(SUM(s.precio), 0) as ingresos
      FROM citas c
      INNER JOIN servicios s ON c.servicio_id = s.id
      WHERE c.barbero_id = ?
      GROUP BY estado`,
      [barbero_id],
    );

    const resumen = {
      pendiente: 0,
      confirmada: 0,
      completada: 0,
      cancelada: 0,
      ingresos_completados: 0,
      total: 0,
    };

    for (const row of resumenRows) {
      if (row.estado === "pendiente") resumen.pendiente = row.total;
      if (row.estado === "confirmada") resumen.confirmada = row.total;
      if (row.estado === "completada") {
        resumen.completada = row.total;
        resumen.ingresos_completados = row.ingresos;
      }
      if (row.estado === "cancelada") resumen.cancelada = row.total;
    }
    resumen.total =
      resumen.pendiente +
      resumen.confirmada +
      resumen.completada +
      resumen.cancelada;

    let citasQuery = `
      SELECT c.*, 
             u.nombre as cliente_nombre, u.email as cliente_email,
             s.nombre as servicio_nombre, s.duracion, s.precio
      FROM citas c
      JOIN usuarios u ON c.cliente_id = u.id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.barbero_id = ?
    `;
    const queryParams = [barbero_id];

    if (fecha) {
      citasQuery += ` AND c.fecha = ?`;
      queryParams.push(fecha);
    }

    if (estado && estado !== "todos") {
      citasQuery += ` AND c.estado = ?`;
      queryParams.push(estado);
    }

    const limitNum = parseInt(limit);
    citasQuery += ` ORDER BY c.fecha DESC, c.hora ASC LIMIT ${limitNum}`;

    const [citas] = await pool.execute(citasQuery, queryParams);

    return ok(res, {
      barbero: {
        id: barbero.id,
        nombre: barbero.nombre,
        email: barbero.email,
        telefono: barbero.telefono,
      },
      estadisticas: {
        total_citas: parseInt(estadisticas[0]?.total_citas) || 0,
        pendientes: parseInt(estadisticas[0]?.pendientes) || 0,
        confirmadas: parseInt(estadisticas[0]?.confirmadas) || 0,
        completadas: parseInt(estadisticas[0]?.completadas) || 0,
        canceladas: parseInt(estadisticas[0]?.canceladas) || 0,
        ingresos_totales: parseFloat(estadisticas[0]?.ingresos_totales) || 0,
        tasa_exito:
          estadisticas[0]?.total_citas > 0
            ? (
                (estadisticas[0]?.completadas / estadisticas[0]?.total_citas) *
                100
              ).toFixed(1)
            : 0,
      },
      resumen: resumen,
      citas: citas,
      total_citas_filtradas: citas.length,
      filtros_aplicados: {
        fecha: fecha || null,
        estado: estado || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getResumenCitas = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const resumen = await barberoCitaService.getResumenCitas(
      req.usuario.id,
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { resumen });
  } catch (error) {
    next(error);
  }
};
