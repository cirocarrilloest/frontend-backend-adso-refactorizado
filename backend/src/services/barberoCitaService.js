// backend/src/services/barberoCitaService.js
import { citaRepository } from "../repositories/citaRepository.js";
import { notificacionService } from "./notificacionService.js";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../utils/errors.js";
import { fechaHoyStr, getDiaSemana } from "../utils/dateUtils.js";
import { getPool } from "../config/db.js";

/**
 * Servicio de citas para barberos
 * Responsabilidad: Reglas de negocio específicas del rol barbero
 */

export const barberoCitaService = {
  /**
   * Obtener agenda del día para un barbero
   */
  async getAgendaDia(barberoId, fecha = null, usuarioId, usuarioRol) {
    const fechaConsulta = fecha || fechaHoyStr();

    // Validar permisos: barbero solo puede ver su propia agenda
    if (
      usuarioRol === "barbero" &&
      parseInt(barberoId) !== parseInt(usuarioId)
    ) {
      throw new ForbiddenError(
        "No tienes permiso para ver la agenda de otro barbero",
      );
    }

    const citas = await citaRepository.findByBarberoAndDate(
      barberoId,
      fechaConsulta,
    );
    return { fecha: fechaConsulta, citas, total_citas: citas.length };
  },

  /**
   * Obtener agenda semanal de un barbero
   */
  async getAgendaSemana(barberoId, fechaInicio, usuarioId, usuarioRol) {
    if (
      usuarioRol === "barbero" &&
      parseInt(barberoId) !== parseInt(usuarioId)
    ) {
      throw new ForbiddenError(
        "No tienes permiso para ver la agenda de otro barbero",
      );
    }

    // Calcular fecha fin (7 días después)
    const inicio = new Date(fechaInicio);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6);
    const fechaFin = fin.toISOString().split("T")[0];

    const citas = await citaRepository.findByBarberoAndDateRange(
      barberoId,
      fechaInicio,
      fechaFin,
    );

    // Agrupar por fecha
    const agenda = {};
    citas.forEach((cita) => {
      const fecha = cita.fecha;
      if (!agenda[fecha]) agenda[fecha] = [];
      agenda[fecha].push(cita);
    });

    return { agenda, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
  },

  /**
   * Confirmar una cita (pendiente → confirmada)
   */
  async confirmar(citaId, barberoId) {
    const cita = await citaRepository.findById(citaId);
    if (!cita) {
      throw new NotFoundError("Cita");
    }

    if (cita.barbero_id !== barberoId) {
      throw new ForbiddenError("No tienes permiso para confirmar esta cita");
    }

    if (cita.estado !== "pendiente") {
      throw new BusinessRuleError(
        `No se puede confirmar una cita en estado "${cita.estado}"`,
      );
    }

    const citaConfirmada = await citaRepository.updateEstado(
      citaId,
      "confirmada",
    );

    // Notificar al cliente
    notificacionService
      .crear({
        usuarioId: cita.cliente_id,
        tipo: "cita_confirmada",
        titulo: "Cita confirmada",
        mensaje: `Tu cita del ${cita.fecha} a las ${cita.hora.slice(0, 5)} ha sido confirmada por el barbero`,
        data: { citaId },
      })
      .catch((err) => console.error("[Notificacion] Error:", err));

    return citaConfirmada;
  },

  /**
   * Finalizar una cita (confirmada → completada)
   */
  async finalizar(citaId, barberoId) {
    const cita = await citaRepository.findById(citaId);
    if (!cita) {
      throw new NotFoundError("Cita");
    }

    if (cita.barbero_id !== barberoId) {
      throw new ForbiddenError("No tienes permiso para finalizar esta cita");
    }

    if (cita.estado !== "confirmada") {
      throw new BusinessRuleError(
        `No se puede finalizar una cita en estado "${cita.estado}"`,
      );
    }

    const citaFinalizada = await citaRepository.updateEstado(
      citaId,
      "completada",
    );

    // Notificar al cliente
    notificacionService
      .crear({
        usuarioId: cita.cliente_id,
        tipo: "cita_completada",
        titulo: "Cita completada",
        mensaje: `Tu cita del ${cita.fecha} ha sido marcada como completada. ¡Gracias por visitarnos!`,
        data: { citaId },
      })
      .catch((err) => console.error("[Notificacion] Error:", err));

    return citaFinalizada;
  },

  /**
   * Obtener resumen de citas por estado para un barbero (CORREGIDO)
   * Retorna un objeto con los totales por estado y los ingresos
   */
  async getResumenCitas(barberoId, fechaInicio = null, fechaFin = null) {
    const pool = getPool();

    let query = `
      SELECT 
        c.estado, 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN c.estado = 'completada' THEN s.precio ELSE 0 END), 0) as ingreso
      FROM citas c
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.barbero_id = ?
    `;
    const params = [barberoId];

    if (fechaInicio && fechaFin) {
      query += " AND c.fecha BETWEEN ? AND ?";
      params.push(fechaInicio, fechaFin);
    }

    query += " GROUP BY c.estado";

    const [rows] = await pool.execute(query, params);

    // Formatear resultado como objeto
    const resumen = {
      pendiente: 0,
      confirmada: 0,
      completada: 0,
      cancelada: 0,
      total: 0,
      ingresos: 0,
    };

    rows.forEach((row) => {
      switch (row.estado) {
        case "pendiente":
          resumen.pendiente = row.total;
          break;
        case "confirmada":
          resumen.confirmada = row.total;
          break;
        case "completada":
          resumen.completada = row.total;
          resumen.ingresos = row.ingreso;
          break;
        case "cancelada":
          resumen.cancelada = row.total;
          break;
      }
      resumen.total += row.total;
    });

    return resumen;
  },

  /**
   * Obtener horarios disponibles de un barbero para una fecha
   */
  async getHorariosDisponibles(barberoId, fecha, duracionSlot = 30) {
    // Obtener horario laboral del barbero
    const horario = await citaRepository.getHorarioByDay(barberoId, fecha);

    if (!horario) {
      return {
        horarios: [],
        mensaje: "El barbero no tiene horario configurado para este día",
      };
    }

    // Generar slots de 30 minutos
    const slots = [];
    let [horaInicio, minInicio] = horario.hora_inicio.split(":").map(Number);
    let [horaFin, minFin] = horario.hora_fin.split(":").map(Number);

    let minutosActual = horaInicio * 60 + minInicio;
    const minutosFin = horaFin * 60 + minFin;

    while (minutosActual < minutosFin) {
      const hora = Math.floor(minutosActual / 60);
      const min = minutosActual % 60;
      slots.push(
        `${String(hora).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      );
      minutosActual += duracionSlot;
    }

    // Obtener horarios ocupados
    const ocupados = await citaRepository.getHorariosOcupados(barberoId, fecha);
    const ocupadosSet = new Set(ocupados.map((h) => String(h).slice(0, 5)));

    // Filtrar slots ocupados
    const disponibles = slots.filter((slot) => !ocupadosSet.has(slot));

    // Si es hoy, filtrar horas pasadas
    const hoy = fechaHoyStr();
    if (fecha === hoy) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
      return {
        horarios: disponibles.filter((slot) => slot > horaActual),
        barbero: { id: barberoId },
      };
    }

    return { horarios: disponibles, barbero: { id: barberoId } };
  },
};

export default barberoCitaService;
