// src/services/adminCitaService.js
import { citaRepository } from "../repositories/citaRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { servicioRepository } from "../repositories/servicioRepository.js";
import { notificacionService } from "./notificacionService.js";
import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../utils/errors.js";
import { validarFechaHoraFutura, normalizarFecha } from "../utils/dateUtils.js";

/**
 * Servicio de citas para administradores
 * Responsabilidad: Operaciones administrativas sobre citas
 */

export const adminCitaService = {
  /**
   * Crear una cita como administrador (para cualquier cliente)
   */
  async crearCitaAdmin({
    clienteId,
    barberoId,
    servicioId,
    fecha,
    hora,
    notas,
  }) {
    // Validar cliente
    const cliente = await userRepository.findById(clienteId);
    if (!cliente || cliente.rol !== "cliente") {
      throw new ValidationError(
        "Cliente no encontrado o no es un cliente válido",
      );
    }

    // Validar barbero
    const barbero = await userRepository.findById(barberoId);
    if (!barbero || barbero.rol !== "barbero") {
      throw new ValidationError("Barbero no encontrado");
    }

    // Validar servicio
    const servicio = await servicioRepository.findById(servicioId);
    if (!servicio || !servicio.activo) {
      throw new ValidationError("Servicio no encontrado o inactivo");
    }

    const fechaNorm = normalizarFecha(fecha);

    // Validar fecha/hora
    const errorFecha = validarFechaHoraFutura(fechaNorm, hora);
    if (errorFecha) {
      throw new ValidationError(errorFecha.message);
    }

    // Verificar disponibilidad
    const duplicado = await citaRepository.existsDuplicate(
      barberoId,
      fechaNorm,
      hora,
    );
    if (duplicado) {
      throw new ConflictError("El horario seleccionado no está disponible");
    }

    // Crear cita (confirmada directamente por admin)
    const citaCreada = await citaRepository.create({
      cliente_id: clienteId,
      barbero_id: barberoId,
      servicio_id: servicioId,
      fecha: fechaNorm,
      hora,
      notas,
      estado: "confirmada",
    });

    // Notificaciones
    await Promise.all([
      notificacionService.crear({
        usuarioId: clienteId,
        tipo: "cita_nueva",
        titulo: "Cita agendada por administrador",
        mensaje: `El administrador agendó tu cita de ${servicio.nombre} el ${fechaNorm} a las ${hora} con ${barbero.nombre}`,
        data: { citaId: citaCreada.id },
      }),
      notificacionService.crear({
        usuarioId: barberoId,
        tipo: "cita_nueva",
        titulo: "Nueva cita asignada",
        mensaje: `Se te ha asignado una nueva cita de ${cliente.nombre} el ${fechaNorm} a las ${hora} - ${servicio.nombre}`,
        data: { citaId: citaCreada.id },
      }),
    ]);

    return citaCreada;
  },

  /**
   * Editar una cita como administrador
   */
  async editarCitaAdmin(citaId, campos) {
    const citaExistente = await citaRepository.findById(citaId);
    if (!citaExistente) {
      throw new NotFoundError("Cita");
    }

    const updates = {};

    // Validar fecha si se está cambiando
    if (campos.fecha || campos.hora) {
      const nuevaFecha = campos.fecha || citaExistente.fecha;
      const nuevaHora = campos.hora || citaExistente.hora;
      const fechaNorm = normalizarFecha(nuevaFecha);

      const errorFecha = validarFechaHoraFutura(fechaNorm, nuevaHora);
      if (errorFecha) {
        throw new ValidationError(errorFecha.message);
      }

      updates.fecha = fechaNorm;
      updates.hora = nuevaHora;
    }

    // Verificar duplicado si cambia barbero/fecha/hora
    const barberoId = campos.barbero_id || citaExistente.barbero_id;
    const fecha = updates.fecha || citaExistente.fecha;
    const hora = updates.hora || citaExistente.hora;

    if (
      campos.barbero_id !== undefined ||
      campos.fecha !== undefined ||
      campos.hora !== undefined
    ) {
      const duplicado = await citaRepository.existsDuplicate(
        barberoId,
        fecha,
        hora,
        citaId,
      );
      if (duplicado) {
        throw new ConflictError("El barbero ya tiene una cita en ese horario");
      }
    }

    // Aplicar actualizaciones
    if (campos.barbero_id !== undefined) updates.barbero_id = campos.barbero_id;
    if (campos.servicio_id !== undefined)
      updates.servicio_id = campos.servicio_id;
    if (campos.estado !== undefined) updates.estado = campos.estado;
    if (campos.notas !== undefined) updates.notas = campos.notas;

    const citaActualizada = await citaRepository.update(citaId, updates);

    // Notificar cambios importantes
    if (updates.fecha || updates.hora) {
      await notificacionService.crear({
        usuarioId: citaExistente.cliente_id,
        tipo: "cita_editada_admin",
        titulo: "Tu cita fue modificada",
        mensaje: `Tu cita ha sido modificada. Nueva fecha: ${updates.fecha || citaExistente.fecha} a las ${String(updates.hora || citaExistente.hora).slice(0, 5)}`,
        data: { citaId, cambios: campos },
      });
    }

    if (
      campos.barbero_id !== undefined &&
      campos.barbero_id !== citaExistente.barbero_id
    ) {
      // Notificar al barbero anterior
      if (citaExistente.barbero_id) {
        await notificacionService.crear({
          usuarioId: citaExistente.barbero_id,
          tipo: "cita_editada_admin",
          titulo: "Cita reasignada",
          mensaje: `La cita #${citaId} ya no está asignada a ti`,
          data: { citaId },
        });
      }
      // Notificar al nuevo barbero
      const nuevoBarbero = await userRepository.findById(campos.barbero_id);
      if (nuevoBarbero) {
        await notificacionService.crear({
          usuarioId: campos.barbero_id,
          tipo: "cita_editada_admin",
          titulo: "Nueva cita asignada",
          mensaje: `Se te ha asignado una cita para el ${updates.fecha || citaExistente.fecha} a las ${String(updates.hora || citaExistente.hora).slice(0, 5)}`,
          data: { citaId },
        });
      }
    }

    return citaActualizada;
  },

  /**
   * Obtener todas las citas con paginación y filtros
   */
  async getAllCitas(filtros = {}, paginacion = {}) {
    return citaRepository.findAll(filtros, paginacion);
  },

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats() {
    return citaRepository.getDashboardStats();
  },

  /**
   * Obtener reporte de ingresos
   */
  async getReporteIngresos(periodo, fechaInicio, fechaFin) {
    return citaRepository.getIngresosReport(periodo, fechaInicio, fechaFin);
  },
};

export default adminCitaService;
