// backend/src/services/citaService/clienteService.js
import * as citaModel from "../../models/citaModel.js";
import { crearNotificacion } from "../../models/notificacionModel.js";
import {
  verificarBarbero,
  verificarServicio,
  validarFechaCita,
  verificarHorarioLaboral,
} from "./helpers.js";
import { TIPOS_NOTIFICACION } from "./constants.js";

/**
 * AGENDAR NUEVA CITA
 * @param {Object} params - Parámetros
 * @param {number} params.clienteId - ID del cliente
 * @param {number} params.barberoId - ID del barbero
 * @param {number} params.servicioId - ID del servicio
 * @param {string} params.fecha - Fecha (YYYY-MM-DD)
 * @param {string} params.hora - Hora (HH:MM:SS)
 * @param {string} params.notas - Notas opcionales
 * @param {string} params.clienteNombre - Nombre del cliente
 * @returns {Promise<{cita: Object, error: string, conflict: string}>}
 *
 * Frontend: Formulario de agendar cita (Cliente)
 * - Componente: AgendarCitaForm
 * - Endpoint: POST /api/citas
 *
 * Backend relacionado:
 * - citaModel.createCita
 * - citaModel.verificarHorarioLaboral
 * - citaModel.verificarDuplicado
 * - crearNotificacion
 */
export const agendarCita = async ({
  clienteId,
  barberoId,
  servicioId,
  fecha,
  hora,
  notas,
  clienteNombre,
}) => {
  // Validar fecha
  const { fechaNorm, error: errorFecha } = await validarFechaCita(fecha, hora);
  if (errorFecha) return { error: errorFecha };

  // Validar barbero
  const { barbero, error: errorBarbero } = await verificarBarbero(barberoId);
  if (errorBarbero) return { error: errorBarbero };

  // Validar servicio
  const { servicio, error: errorServicio } =
    await verificarServicio(servicioId);
  if (errorServicio) return { error: errorServicio };

  // Verificar horario laboral
  const enHorario = await verificarHorarioLaboral(barberoId, fechaNorm, hora);
  if (!enHorario) {
    return {
      error:
        "El horario seleccionado está fuera de la jornada laboral del barbero",
    };
  }

  // Verificar duplicado
  const duplicado = await citaModel.verificarDuplicado(
    barberoId,
    fechaNorm,
    hora,
  );
  if (duplicado) {
    return { conflict: "El barbero ya tiene una cita agendada en ese horario" };
  }

  // Crear cita
  const nuevaCita = await citaModel.createCita({
    cliente_id: clienteId,
    barbero_id: barberoId,
    servicio_id: servicioId,
    fecha: fechaNorm,
    hora,
    notas,
  });

  // Notificar al barbero
  await crearNotificacion(
    barberoId,
    TIPOS_NOTIFICACION.CITA_NUEVA,
    "Nueva cita agendada",
    `${clienteNombre} ha agendado ${servicio.nombre} para el ${fechaNorm} a las ${hora}`,
    { citaId: nuevaCita.id, cliente: clienteNombre, servicio: servicio.nombre },
  );

  return { cita: nuevaCita };
};

/**
 * REAGENDAR CITA (cliente)
 * @param {Object} params
 * @param {number} params.citaId - ID de la cita
 * @param {string} params.fecha - Nueva fecha
 * @param {string} params.hora - Nueva hora
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.usuarioRol - Rol del usuario
 * @returns {Promise<{cita: Object, error: string, notFound: string, forbidden: string, conflict: string}>}
 *
 * Frontend: Modal de reagendar cita (Cliente)
 * - Componente: ReagendarCitaModal
 * - Endpoint: PUT /api/citas/:id/reagendar
 *
 * Backend relacionado:
 * - citaModel.getCitaById
 * - citaModel.updateCita
 * - citaModel.verificarDuplicado
 * - crearNotificacion
 */
export const reagendarCita = async ({
  citaId,
  fecha,
  hora,
  usuarioId,
  usuarioRol,
}) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  // Validar permisos
  if (usuarioRol === "cliente" && cita.cliente_id !== usuarioId) {
    return { forbidden: "No tienes permiso para reagendar esta cita" };
  }

  // Validar estado
  if (cita.estado !== "pendiente") {
    return {
      error: `No se puede reagendar una cita en estado "${cita.estado}"`,
    };
  }

  // Validar nueva fecha
  const { error: errorFecha } = await validarFechaCita(fecha, hora);
  if (errorFecha) return { error: errorFecha };

  // Verificar disponibilidad
  const duplicado = await citaModel.verificarDuplicado(
    cita.barbero_id,
    fecha,
    hora,
  );
  if (duplicado) {
    return { conflict: "El barbero ya tiene una cita en ese horario" };
  }

  // Actualizar cita
  const citaActualizada = await citaModel.updateCita(citaId, {
    fecha,
    hora,
    notas: cita.notas,
  });

  // Notificar al barbero
  await crearNotificacion(
    cita.barbero_id,
    TIPOS_NOTIFICACION.SISTEMA,
    "Cita reagendada",
    `La cita de ${cita.cliente_nombre} ha sido reagendada para el ${fecha} a las ${hora}`,
    { citaId },
  );

  return { cita: citaActualizada };
};

/**
 * CANCELAR CITA (cliente o barbero)
 * @param {Object} params
 * @param {number} params.citaId - ID de la cita
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.usuarioRol - Rol del usuario
 * @param {string} params.usuarioNombre - Nombre del usuario
 * @returns {Promise<{cita: Object, error: string, notFound: string, forbidden: string}>}
 *
 * Frontend: Botón cancelar cita
 * - Componente: CancelarCitaButton
 * - Endpoint: DELETE /api/citas/:id
 *
 * Backend relacionado:
 * - citaModel.getCitaById
 * - citaModel.cancelarCita
 * - crearNotificacion
 */
export const cancelarCita = async ({
  citaId,
  usuarioId,
  usuarioRol,
  usuarioNombre,
}) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  // Validar permisos
  if (usuarioRol === "cliente" && cita.cliente_id !== usuarioId) {
    return { forbidden: "No tienes permiso para cancelar esta cita" };
  }
  if (usuarioRol === "barbero" && cita.barbero_id !== usuarioId) {
    return { forbidden: "No tienes permiso para cancelar esta cita" };
  }

  // Cancelar cita
  const citaCancelada = await citaModel.cancelarCita(citaId);

  // Notificar según quién canceló
  if (usuarioRol === "cliente") {
    await crearNotificacion(
      cita.barbero_id,
      TIPOS_NOTIFICACION.CITA_CANCELADA,
      "Cita cancelada por el cliente",
      `${usuarioNombre} ha cancelado la cita del ${cita.fecha} a las ${cita.hora}`,
      { citaId },
    );
  } else if (usuarioRol === "barbero") {
    await crearNotificacion(
      cita.cliente_id,
      TIPOS_NOTIFICACION.CITA_CANCELADA,
      "Cita cancelada por el barbero",
      `El barbero ha cancelado tu cita del ${cita.fecha} a las ${cita.hora}`,
      { citaId },
    );
  }

  return { cita: citaCancelada };
};
