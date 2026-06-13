// backend/src/services/clienteCitaService/cancelarService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import {
  validarCitaExistente,
  validarPermisoCita,
  validarEstadoCita,
} from "./helpers.js";

/**
 * CANCELAR CITA COMO CLIENTE
 * @param {Object} params - Parámetros
 * @param {number} params.citaId - ID de la cita
 * @param {number} params.usuarioId - ID del usuario (cliente)
 * @param {string} params.usuarioNombre - Nombre del usuario
 * @returns {Promise<Object>} Cita cancelada
 * @throws {NotFoundError} Si la cita no existe
 * @throws {ForbiddenError} Si no tiene permiso
 * @throws {BusinessRuleError} Si la cita no está en estado pendiente
 *
 * Frontend: Botón cancelar cita
 * - Componente: CancelarCitaButton
 * - Endpoint: DELETE /api/citas/:id
 *
 * Backend relacionado:
 * - citaRepository.findById
 * - citaRepository.updateEstado
 * - notificacionService.crear
 */
export const cancelar = async ({ citaId, usuarioId, usuarioNombre }) => {
  // 1. Validar que la cita existe
  const cita = await validarCitaExistente(citaId);

  // 2. Validar permiso (solo el dueño)
  validarPermisoCita(cita, usuarioId);

  // 3. Validar estado (solo pendiente)
  validarEstadoCita(cita, ["pendiente"]);

  // 4. Cancelar la cita
  const citaCancelada = await citaRepository.updateEstado(citaId, "cancelada");

  // 5. Notificar al barbero
  notificacionService
    .crear({
      usuarioId: cita.barbero_id,
      tipo: "cita_cancelada",
      titulo: "Cita cancelada por el cliente",
      mensaje: `${usuarioNombre} ha cancelado la cita del ${cita.fecha} a las ${cita.hora.slice(0, 5)}`,
      data: { citaId },
    })
    .catch((err) =>
      console.error("[Notificacion] Error al notificar barbero:", err),
    );

  return citaCancelada;
};
