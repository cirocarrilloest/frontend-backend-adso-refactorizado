// src/services/clienteCitaService.js
import { citaRepository } from "../repositories/citaRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { servicioRepository } from "../repositories/servicioRepository.js";
import { notificacionService } from "./notificacionService.js";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BusinessRuleError,
} from "../utils/errors.js";
import { validarFechaHoraFutura, normalizarFecha } from "../utils/dateUtils.js";

/**
 * Servicio de citas para clientes
 * Responsabilidad: Reglas de negocio específicas del rol cliente
 */

export const clienteCitaService = {
  /**
   * Agendar una nueva cita como cliente
   */
  async agendar({
    clienteId,
    barberoId,
    servicioId,
    fecha,
    hora,
    notas,
    clienteNombre,
  }) {
    const fechaNorm = normalizarFecha(fecha);

    // 1. Validar que la fecha/hora no sea pasada
    const errorFecha = validarFechaHoraFutura(fechaNorm, hora);
    if (errorFecha) {
      throw new ValidationError(errorFecha.message);
    }

    // 2. Validar que el barbero existe y es válido
    const barbero = await userRepository.findById(barberoId);
    if (!barbero || barbero.rol !== "barbero") {
      throw new ValidationError("El barbero seleccionado no es válido");
    }

    // 3. Validar que el servicio existe y está activo
    const servicio = await servicioRepository.findById(servicioId);
    if (!servicio || !servicio.activo) {
      throw new ValidationError("El servicio seleccionado no está disponible");
    }

    // 4. Validar que la hora está dentro del horario laboral del barbero
    const enHorario = await citaRepository.isWithinWorkingHours(
      barberoId,
      fechaNorm,
      hora,
    );
    if (!enHorario) {
      throw new ValidationError(
        "El horario seleccionado está fuera de la jornada laboral del barbero",
      );
    }

    // 5. Validar que no hay duplicado
    const duplicado = await citaRepository.existsDuplicate(
      barberoId,
      fechaNorm,
      hora,
    );
    if (duplicado) {
      throw new ConflictError(
        "El barbero ya tiene una cita agendada en ese horario",
      );
    }

    // 6. Crear la cita
    const nuevaCita = await citaRepository.create({
      cliente_id: clienteId,
      barbero_id: barberoId,
      servicio_id: servicioId,
      fecha: fechaNorm,
      hora,
      notas,
      estado: "pendiente",
    });

    // 7. Notificar al barbero (fire-and-forget)
    notificacionService
      .crear({
        usuarioId: barberoId,
        tipo: "cita_nueva",
        titulo: "Nueva cita agendada",
        mensaje: `${clienteNombre} ha agendado ${servicio.nombre} para el ${fechaNorm} a las ${hora}`,
        data: {
          citaId: nuevaCita.id,
          cliente: clienteNombre,
          servicio: servicio.nombre,
        },
      })
      .catch((err) => console.error("[Notificacion] Error:", err));

    return nuevaCita;
  },

  /**
   * Cancelar una cita como cliente
   */
  async cancelar({ citaId, usuarioId, usuarioNombre }) {
    const cita = await citaRepository.findById(citaId);
    if (!cita) {
      throw new NotFoundError("Cita");
    }

    // Verificar permiso: solo el dueño de la cita
    if (cita.cliente_id !== usuarioId) {
      throw new ForbiddenError("No tienes permiso para cancelar esta cita");
    }

    // Verificar estado: solo pendiente
    if (cita.estado !== "pendiente") {
      throw new BusinessRuleError(
        `No se puede cancelar una cita en estado "${cita.estado}"`,
      );
    }

    // Aquí se podría agregar validación de antelación mínima (ej: 2 horas)
    // usando la configuración del sistema

    const citaCancelada = await citaRepository.updateEstado(
      citaId,
      "cancelada",
    );

    // Notificar al barbero
    notificacionService
      .crear({
        usuarioId: cita.barbero_id,
        tipo: "cita_cancelada",
        titulo: "Cita cancelada por el cliente",
        mensaje: `${usuarioNombre} ha cancelado la cita del ${cita.fecha} a las ${cita.hora.slice(0, 5)}`,
        data: { citaId },
      })
      .catch((err) => console.error("[Notificacion] Error:", err));

    return citaCancelada;
  },

  /**
   * Reagendar una cita (cambiar fecha/hora)
   */
  async reagendar({ citaId, nuevaFecha, nuevaHora, usuarioId }) {
    const cita = await citaRepository.findById(citaId);
    if (!cita) {
      throw new NotFoundError("Cita");
    }

    // Verificar permiso
    if (cita.cliente_id !== usuarioId) {
      throw new ForbiddenError("No tienes permiso para reagendar esta cita");
    }

    // Verificar estado
    if (cita.estado !== "pendiente") {
      throw new BusinessRuleError(
        `No se puede reagendar una cita en estado "${cita.estado}"`,
      );
    }

    const fechaNorm = normalizarFecha(nuevaFecha);

    // Validar nueva fecha/hora
    const errorFecha = validarFechaHoraFutura(fechaNorm, nuevaHora);
    if (errorFecha) {
      throw new ValidationError(errorFecha.message);
    }

    // Validar disponibilidad del nuevo horario
    const duplicado = await citaRepository.existsDuplicate(
      cita.barbero_id,
      fechaNorm,
      nuevaHora,
      citaId,
    );
    if (duplicado) {
      throw new ConflictError("El barbero ya tiene una cita en ese horario");
    }

    const citaActualizada = await citaRepository.update(citaId, {
      fecha: fechaNorm,
      hora: nuevaHora,
    });

    // Notificar al barbero del cambio
    notificacionService
      .crear({
        usuarioId: cita.barbero_id,
        tipo: "cita_reagendada",
        titulo: "Cita reagendada",
        mensaje: `La cita de ${cita.cliente_nombre} ha sido reagendada para el ${fechaNorm} a las ${nuevaHora}`,
        data: { citaId },
      })
      .catch((err) => console.error("[Notificacion] Error:", err));

    return citaActualizada;
  },

  /**
   * Obtener citas del cliente autenticado
   */
  async getMisCitas(clienteId, filtros = {}) {
    return citaRepository.findByClienteId(clienteId, filtros);
  },

  /**
   * Obtener próximas citas del cliente
   */
  async getProximasCitas(clienteId) {
    return citaRepository.findByClienteId(clienteId, {
      soloFuturas: true,
      estado: "pendiente,confirmada",
      orden: "ASC",
    });
  },

  /**
   * Obtener historial de citas del cliente
   */
  async getHistorialCitas(clienteId, limite = 10) {
    return citaRepository.findByClienteId(clienteId, {
      limite,
      orden: "DESC",
    });
  },
};

export default clienteCitaService;
