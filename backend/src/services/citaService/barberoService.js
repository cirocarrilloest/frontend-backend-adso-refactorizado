// backend/src/services/citaService/barberoService.js
import * as citaModel from "../../models/citaModel.js";
import { crearNotificacion } from "../../models/notificacionModel.js";
import { ESTADOS_VALIDOS, TIPOS_NOTIFICACION } from "./constants.js";

/**
 * ACTUALIZAR ESTADO DE CITA (barbero)
 * @param {Object} params
 * @param {number} params.citaId - ID de la cita
 * @param {string} params.estado - Nuevo estado
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.usuarioRol - Rol del usuario
 * @returns {Promise<{cita: Object, error: string, notFound: string, forbidden: string}>}
 *
 * Frontend: Selector de estado (Barbero)
 * - Componente: CambiarEstadoSelect
 * - Endpoint: PUT /api/citas/:id/estado
 *
 * Backend relacionado:
 * - citaModel.getCitaById
 * - citaModel.updateCitaEstado
 */
export const actualizarEstadoCita = async ({
  citaId,
  estado,
  usuarioId,
  usuarioRol,
}) => {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return { error: "Estado no válido" };
  }

  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  // Validar permisos
  if (
    usuarioRol === "barbero" &&
    parseInt(cita.barbero_id) !== parseInt(usuarioId)
  ) {
    return { forbidden: "No tienes permiso para modificar esta cita" };
  }

  const citaActualizada = await citaModel.updateCitaEstado(citaId, estado);
  return { cita: citaActualizada };
};

/**
 * CONFIRMAR CITA (barbero)
 * @param {Object} params
 * @param {number} params.citaId - ID de la cita
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.usuarioRol - Rol del usuario
 * @returns {Promise<{cita: Object, error: string, notFound: string, forbidden: string}>}
 *
 * Frontend: Botón confirmar cita (Barbero)
 * - Componente: ConfirmarCitaButton
 * - Endpoint: PATCH /api/citas/:id/confirmar
 *
 * Backend relacionado:
 * - citaModel.getCitaById
 * - citaModel.updateCitaEstado
 * - crearNotificacion
 */
export const confirmarCita = async ({ citaId, usuarioId, usuarioRol }) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  // Validar permisos
  if (
    usuarioRol === "barbero" &&
    parseInt(cita.barbero_id) !== parseInt(usuarioId)
  ) {
    return { forbidden: "No tienes permiso para confirmar esta cita" };
  }

  // Validar estado
  if (cita.estado !== "pendiente") {
    return {
      error: `No se puede confirmar una cita en estado "${cita.estado}"`,
    };
  }

  const citaConfirmada = await citaModel.updateCitaEstado(citaId, "confirmada");

  // Notificar al cliente
  await crearNotificacion(
    cita.cliente_id,
    TIPOS_NOTIFICACION.CITA_CONFIRMADA,
    "Cita confirmada",
    `Tu cita del ${cita.fecha} a las ${cita.hora} ha sido confirmada por el barbero`,
    { citaId },
  );

  return { cita: citaConfirmada };
};

/**
 * FINALIZAR CITA (barbero)
 * @param {Object} params
 * @param {number} params.citaId - ID de la cita
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.usuarioRol - Rol del usuario
 * @returns {Promise<{cita: Object, error: string, notFound: string, forbidden: string}>}
 *
 * Frontend: Botón finalizar servicio (Barbero)
 * - Componente: FinalizarServicioButton
 * - Endpoint: PATCH /api/citas/:id/finalizar
 *
 * Backend relacionado:
 * - citaModel.getCitaById
 * - citaModel.updateCitaEstado
 * - crearNotificacion
 */
export const finalizarCita = async ({ citaId, usuarioId, usuarioRol }) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  // Validar permisos
  if (
    usuarioRol === "barbero" &&
    parseInt(cita.barbero_id) !== parseInt(usuarioId)
  ) {
    return { forbidden: "No tienes permiso para finalizar esta cita" };
  }

  const citaFinalizada = await citaModel.updateCitaEstado(citaId, "completada");

  // Notificar al cliente
  await crearNotificacion(
    cita.cliente_id,
    TIPOS_NOTIFICACION.SISTEMA,
    "✨ Cita completada",
    `Tu cita del ${cita.fecha} ha sido marcada como completada. ¡Gracias por visitarnos!`,
    { citaId },
  );

  return { cita: citaFinalizada };
};
