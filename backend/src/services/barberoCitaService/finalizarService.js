// backend/src/services/barberoCitaService/finalizarService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import {
  validarCitaExistente,
  validarPerteneceBarbero,
  validarEstadoCita,
} from "./helpers.js";

/**
 * FINALIZAR CITA (confirmada → completada)
 * @param {number} citaId - ID de la cita
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Object>} Cita finalizada
 * @throws {NotFoundError} Si la cita no existe
 * @throws {ForbiddenError} Si no pertenece al barbero
 * @throws {BusinessRuleError} Si la cita no está en estado confirmada
 *
 * Frontend: Panel barbero - Botón finalizar servicio
 * - Componente: FinalizarServicioButton
 * - Endpoint: PATCH /api/citas/:id/finalizar
 *
 * Backend relacionado:
 * - citaRepository.findById
 * - citaRepository.updateEstado
 * - notificacionService.crear
 */
export const finalizar = async (citaId, barberoId) => {
  // 1. Validar que la cita existe
  const cita = await validarCitaExistente(citaId);

  // 2. Validar que la cita pertenece al barbero
  validarPerteneceBarbero(cita, barberoId, "finalizar esta cita");

  // 3. Validar estado (solo confirmada)
  validarEstadoCita(cita, ["confirmada"], "finalizar");

  // 4. Finalizar la cita
  const citaFinalizada = await citaRepository.updateEstado(
    citaId,
    "completada",
  );

  // 5. Notificar al cliente
  notificacionService
    .crear({
      usuarioId: cita.cliente_id,
      tipo: "cita_completada",
      titulo: "Cita completada",
      mensaje: `Tu cita del ${cita.fecha} ha sido marcada como completada. ¡Gracias por visitarnos!`,
      data: { citaId },
    })
    .catch((err) =>
      console.error("[Notificacion] Error al notificar cliente:", err),
    );

  return citaFinalizada;
};
