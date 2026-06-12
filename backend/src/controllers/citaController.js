// src/controllers/citaController.js
import clienteCitaService from "../services/clienteCitaService.js";
import barberoCitaService from "../services/barberoCitaService.js";
import adminCitaService from "../services/adminCitaService.js";
import citaRepository from "../repositories/citaRepository.js";
import { getPool } from "../config/db.js";
import {
  ok,
  created,
  badRequest,
  forbidden,
  notFound,
} from "../utils/responseUtils.js";

/**
 * Controlador de citas - Capa de presentación
 * Responsabilidad: Validar roles, llamar al servicio correspondiente, formatear respuesta
 */

// ============ CLIENTE ============

export const agendarCita = async (req, res, next) => {
  try {
    if (req.usuario.rol !== "cliente" && req.usuario.rol !== "admin") {
      return forbidden(res, "Solo los clientes pueden agendar citas");
    }

    const { barbero_id, servicio_id, fecha, hora, notas } = req.body;
    if (!barbero_id || !servicio_id || !fecha || !hora) {
      return badRequest(
        res,
        "Faltan campos requeridos: barbero_id, servicio_id, fecha, hora",
      );
    }

    const cita = await clienteCitaService.agendar({
      clienteId: req.usuario.id,
      barberoId: barbero_id,
      servicioId: servicio_id,
      fecha,
      hora,
      notas,
      clienteNombre: req.usuario.nombre,
    });

    return created(res, { message: "Cita agendada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const getMisCitas = async (req, res, next) => {
  try {
    const citas = await clienteCitaService.getMisCitas(req.usuario.id);
    return ok(res, { citas });
  } catch (error) {
    next(error);
  }
};

export const getProximasCitas = async (req, res, next) => {
  try {
    const citas = await clienteCitaService.getProximasCitas(req.usuario.id);
    return ok(res, { citas, total: citas.length });
  } catch (error) {
    next(error);
  }
};

export const getHistorialCitas = async (req, res, next) => {
  try {
    let limite = parseInt(req.query.limite) || 10;
    limite = Math.min(Math.max(limite, 1), 100);
    const citas = await clienteCitaService.getHistorialCitas(
      req.usuario.id,
      limite,
    );
    return ok(res, { citas, total: citas.length, limite });
  } catch (error) {
    next(error);
  }
};

export const cancelarCita = async (req, res, next) => {
  try {
    const cita = await clienteCitaService.cancelar({
      citaId: req.params.id,
      usuarioId: req.usuario.id,
      usuarioNombre: req.usuario.nombre,
    });
    return ok(res, { message: "Cita cancelada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const reagendarCita = async (req, res, next) => {
  try {
    const { fecha, hora } = req.body;
    if (!fecha || !hora) {
      return badRequest(res, "Se requiere fecha y hora");
    }

    const cita = await clienteCitaService.reagendar({
      citaId: req.params.id,
      nuevaFecha: fecha,
      nuevaHora: hora,
      usuarioId: req.usuario.id,
    });

    return ok(res, { message: "Cita reagendada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const getCitaById = async (req, res, next) => {
  try {
    const cita = await citaRepository.findById(req.params.id);
    if (!cita) {
      return notFound(res, "Cita no encontrada");
    }
    // Validar permisos según rol
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return forbidden(res, "No tienes permiso para ver esta cita");
    }
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return forbidden(res, "No tienes permiso para ver esta cita");
    }
    // Admin puede ver cualquier cita
    return ok(res, { cita });
  } catch (error) {
    next(error);
  }
};

// ============ BARBERO ============

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
    const { fecha_inicio, fecha_fin, estado } = req.query;

    // Validar permisos
    if (
      req.usuario.rol === "barbero" &&
      parseInt(barbero_id) !== req.usuario.id
    ) {
      return forbidden(res, "No tienes permiso para ver citas de otro barbero");
    }

    let citas;
    if (fecha_inicio && fecha_fin) {
      citas = await citaRepository.findByBarberoAndDateRange(
        barbero_id,
        fecha_inicio,
        fecha_fin,
      );
    } else if (fecha_inicio) {
      citas = await citaRepository.findByBarberoAndDate(
        barbero_id,
        fecha_inicio,
      );
    } else {
      citas = await citaRepository.findByBarberoAndDate(
        barbero_id,
        new Date().toISOString().split("T")[0],
      );
    }

    // Filtrar por estado si es necesario
    if (estado) {
      citas = citas.filter((c) => c.estado === estado);
    }

    return ok(res, { citas, total: citas.length });
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

export const getHorariosDisponibles = async (req, res, next) => {
  try {
    const { id: barberoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return badRequest(res, "Se requiere fecha");
    }

    const resultado = await barberoCitaService.getHorariosDisponibles(
      barberoId,
      fecha,
    );

    return ok(res, {
      horarios_disponibles: resultado.horarios,
      mensaje:
        resultado.mensaje ||
        `${resultado.horarios.length} horarios disponibles`,
    });
  } catch (error) {
    next(error);
  }
};

export const verificarDisponibilidad = async (req, res, next) => {
  try {
    const { barbero_id, fecha, hora } = req.query;

    if (!barbero_id || !fecha || !hora) {
      return badRequest(res, "Se requiere barbero_id, fecha y hora");
    }

    const disponible = await citaRepository.existsDuplicate(
      barbero_id,
      fecha,
      hora,
    );

    return ok(res, {
      disponible: !disponible,
      mensaje: disponible ? "Horario no disponible" : "Horario disponible",
    });
  } catch (error) {
    next(error);
  }
};

// ============ ADMIN ============

export const crearCitaAdmin = async (req, res, next) => {
  try {
    const { cliente_id, barbero_id, servicio_id, fecha, hora, notas } =
      req.body;

    if (!cliente_id || !barbero_id || !servicio_id || !fecha || !hora) {
      return badRequest(res, "Todos los campos son requeridos");
    }

    const cita = await adminCitaService.crearCitaAdmin({
      clienteId: parseInt(cliente_id),
      barberoId: parseInt(barbero_id),
      servicioId: parseInt(servicio_id),
      fecha,
      hora,
      notas,
    });

    return created(res, {
      message: "Cita creada exitosamente por el administrador",
      cita,
    });
  } catch (error) {
    next(error);
  }
};

export const editarCitaAdmin = async (req, res, next) => {
  try {
    const cita = await adminCitaService.editarCitaAdmin(
      req.params.id,
      req.body,
    );
    return ok(res, { message: "Cita actualizada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const getAllCitas = async (req, res, next) => {
  try {
    const {
      estado,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 15,
    } = req.query;

    const citas = await adminCitaService.getAllCitas(
      { estado, fecha_desde, fecha_hasta },
      { page: parseInt(page), limit: parseInt(limit) },
    );

    return ok(res, { citas });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminCitaService.getDashboardStats();
    return ok(res, { dashboard: stats });
  } catch (error) {
    next(error);
  }
};

export const getDistribucionHoraria = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;

    // Si no hay fechas o son null, usar el último mes
    if (
      !fecha_inicio ||
      fecha_inicio === "null" ||
      fecha_inicio === "undefined" ||
      fecha_inicio === ""
    ) {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      fecha_inicio = haceUnMes.toISOString().split("T")[0];
    }
    if (
      !fecha_fin ||
      fecha_fin === "null" ||
      fecha_fin === "undefined" ||
      fecha_fin === ""
    ) {
      const hoy = new Date();
      fecha_fin = hoy.toISOString().split("T")[0];
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT HOUR(hora) as hora, 
              COUNT(*) as total_citas,
              SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
              SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
       FROM citas
       WHERE fecha BETWEEN ? AND ?
         AND estado != 'pendiente'
       GROUP BY HOUR(hora)
       ORDER BY hora ASC`,
      [fecha_inicio, fecha_fin],
    );

    return ok(res, { distribucion: rows });
  } catch (error) {
    next(error);
  }
};

export const getReporteIngresos = async (req, res, next) => {
  try {
    let { periodo = "mes", fecha_inicio, fecha_fin } = req.query;

    // Si no hay fechas o son null, usar el último mes
    if (
      !fecha_inicio ||
      fecha_inicio === "null" ||
      fecha_inicio === "undefined" ||
      fecha_inicio === ""
    ) {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      fecha_inicio = haceUnMes.toISOString().split("T")[0];
    }
    if (
      !fecha_fin ||
      fecha_fin === "null" ||
      fecha_fin === "undefined" ||
      fecha_fin === ""
    ) {
      const hoy = new Date();
      fecha_fin = hoy.toISOString().split("T")[0];
    }

    const reporte = await adminCitaService.getReporteIngresos(
      periodo,
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { periodo, fecha_inicio, fecha_fin, reporte });
  } catch (error) {
    next(error);
  }
};

export const getServiciosTop = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin, limite = 5 } = req.query;

    console.log("getServiciosTop params:", { fecha_inicio, fecha_fin, limite });

    // Validar limite
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum < 1) limiteNum = 5;
    if (limiteNum > 100) limiteNum = 100;

    const pool = getPool();
    let query, params;

    // Verificar si se enviaron fechas válidas
    const tieneFechas =
      fecha_inicio &&
      fecha_fin &&
      fecha_inicio !== "null" &&
      fecha_inicio !== "undefined" &&
      fecha_fin !== "null" &&
      fecha_fin !== "undefined" &&
      fecha_inicio !== "" &&
      fecha_fin !== "";

    if (tieneFechas) {
      query = `
        SELECT s.id, s.nombre, s.precio, COUNT(c.id) as total_citas
        FROM servicios s
        LEFT JOIN citas c ON s.id = c.servicio_id AND c.estado = 'completada' AND c.fecha BETWEEN ? AND ?
        GROUP BY s.id, s.nombre, s.precio
        ORDER BY total_citas DESC
        LIMIT ?
      `;
      params = [fecha_inicio, fecha_fin, limiteNum];
    } else {
      query = `
        SELECT s.id, s.nombre, s.precio, COUNT(c.id) as total_citas
        FROM servicios s
        LEFT JOIN citas c ON s.id = c.servicio_id AND c.estado = 'completada'
        GROUP BY s.id, s.nombre, s.precio
        ORDER BY total_citas DESC
        LIMIT ?
      `;
      params = [limiteNum];
    }

    const [rows] = await pool.execute(query, params);
    return ok(res, { servicios: rows });
  } catch (error) {
    console.error("Error en getServiciosTop:", error);
    return ok(res, { servicios: [] });
  }
};

export const getClientesTop = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin, limite = 5 } = req.query;

    console.log("getClientesTop params:", { fecha_inicio, fecha_fin, limite });

    // Validar limite
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum < 1) limiteNum = 5;
    if (limiteNum > 100) limiteNum = 100;

    const pool = getPool();
    let query, params;

    // Verificar si se enviaron fechas válidas
    const tieneFechas =
      fecha_inicio &&
      fecha_fin &&
      fecha_inicio !== "null" &&
      fecha_inicio !== "undefined" &&
      fecha_fin !== "null" &&
      fecha_fin !== "undefined" &&
      fecha_inicio !== "" &&
      fecha_fin !== "";

    if (tieneFechas) {
      query = `
        SELECT u.id, u.nombre, u.email, 
               COUNT(c.id) as total_citas, 
               COALESCE(SUM(s.precio), 0) as total_gastado
        FROM usuarios u
        INNER JOIN citas c ON u.id = c.cliente_id AND c.estado = 'completada' AND c.fecha BETWEEN ? AND ?
        INNER JOIN servicios s ON c.servicio_id = s.id
        WHERE u.rol = 'cliente'
        GROUP BY u.id, u.nombre, u.email
        ORDER BY total_citas DESC
        LIMIT ?
      `;
      params = [fecha_inicio, fecha_fin, limiteNum];
    } else {
      query = `
        SELECT u.id, u.nombre, u.email, 
               COUNT(c.id) as total_citas, 
               COALESCE(SUM(s.precio), 0) as total_gastado
        FROM usuarios u
        INNER JOIN citas c ON u.id = c.cliente_id AND c.estado = 'completada'
        INNER JOIN servicios s ON c.servicio_id = s.id
        WHERE u.rol = 'cliente'
        GROUP BY u.id, u.nombre, u.email
        ORDER BY total_citas DESC
        LIMIT ?
      `;
      params = [limiteNum];
    }

    const [rows] = await pool.execute(query, params);
    return ok(res, { clientes: rows });
  } catch (error) {
    console.error("Error en getClientesTop:", error);
    return ok(res, { clientes: [] });
  }
};

export const getTasaCancelacion = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;

    const pool = getPool();
    let query, params;

    // Verificar si se enviaron fechas válidas
    const tieneFechas =
      fecha_inicio &&
      fecha_fin &&
      fecha_inicio !== "null" &&
      fecha_inicio !== "undefined" &&
      fecha_fin !== "null" &&
      fecha_fin !== "undefined" &&
      fecha_inicio !== "" &&
      fecha_fin !== "";

    if (tieneFechas) {
      query = `
        SELECT 
          u.id, u.nombre,
          COUNT(c.id) as total_citas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 2) as tasa_cancelacion
        FROM usuarios u
        LEFT JOIN citas c ON u.id = c.barbero_id AND c.fecha BETWEEN ? AND ?
        WHERE u.rol = 'barbero'
        GROUP BY u.id, u.nombre
        HAVING total_citas > 0
        ORDER BY tasa_cancelacion DESC
      `;
      params = [fecha_inicio, fecha_fin];
    } else {
      query = `
        SELECT 
          u.id, u.nombre,
          COUNT(c.id) as total_citas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 2) as tasa_cancelacion
        FROM usuarios u
        LEFT JOIN citas c ON u.id = c.barbero_id
        WHERE u.rol = 'barbero'
        GROUP BY u.id, u.nombre
        HAVING total_citas > 0
        ORDER BY tasa_cancelacion DESC
      `;
      params = [];
    }

    const [rows] = await pool.execute(query, params);
    return ok(res, { reporte: rows });
  } catch (error) {
    console.error("Error en getTasaCancelacion:", error);
    return ok(res, { reporte: [] });
  }
};

export const getTasaCancelacionPorBarbero = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;

    // Si no hay fechas o son null, usar el último mes
    if (
      !fecha_inicio ||
      fecha_inicio === "null" ||
      fecha_inicio === "undefined" ||
      fecha_inicio === ""
    ) {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      fecha_inicio = haceUnMes.toISOString().split("T")[0];
    }
    if (
      !fecha_fin ||
      fecha_fin === "null" ||
      fecha_fin === "undefined" ||
      fecha_fin === ""
    ) {
      const hoy = new Date();
      fecha_fin = hoy.toISOString().split("T")[0];
    }

    const pool = getPool();

    // Consulta corregida
    const [rows] = await pool.execute(
      `SELECT 
        u.id, u.nombre,
        COUNT(c.id) as total_citas,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        ROUND(IFNULL(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 0), 2) as tasa_cancelacion
       FROM usuarios u
       LEFT JOIN citas c ON u.id = c.barbero_id AND c.fecha BETWEEN ? AND ?
       WHERE u.rol = 'barbero'
       GROUP BY u.id, u.nombre
       HAVING total_citas > 0
       ORDER BY tasa_cancelacion DESC`,
      [fecha_inicio, fecha_fin],
    );

    return ok(res, { barberos: rows });
  } catch (error) {
    console.error("Error en getTasaCancelacionPorBarbero:", error);
    return ok(res, { barberos: [] });
  }
};

// Exportar todos
export default {
  // Cliente
  agendarCita,
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
  cancelarCita,
  reagendarCita,
  getCitaById,
  // Barbero
  getAgendaDia,
  getAgendaSemana,
  confirmarCita,
  finalizarCita,
  actualizarEstadoCita,
  getCitasBarbero,
  getResumenCitas,
  getHorariosDisponibles,
  verificarDisponibilidad,
  // Admin
  crearCitaAdmin,
  editarCitaAdmin,
  getAllCitas,
  getDashboard,
  getDistribucionHoraria,
  getReporteIngresos,
  getServiciosTop,
  getClientesTop,
  getTasaCancelacion,
  getTasaCancelacionPorBarbero,
};
