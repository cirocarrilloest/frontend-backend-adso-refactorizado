// backend/src/services/barberoCitaService/confirmarService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import {
  validarCitaExistente,
  validarPerteneceBarbero,
  validarEstadoCita,
} from "./helpers.js";

/**
 * CONFIRMAR CITA (pendiente → confirmada)
 * @param {number} citaId - ID de la cita
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Object>} Cita confirmada
 * @throws {NotFoundError} Si la cita no existe
 * @throws {ForbiddenError} Si no pertenece al barbero
 * @throws {BusinessRuleError} Si la cita no está en estado pendiente
 *
 * Frontend: Panel barbero - Botón confirmar cita
 * - Componente: ConfirmarCitaButton
 * - Endpoint: PATCH /api/citas/:id/confirmar
 *
 * Backend relacionado:
 * - citaRepository.findById
 * - citaRepository.updateEstado
 * - notificacionService.crear
 */
export const confirmar = async (citaId, barberoId) => {
  // 1. Validar que la cita existe
  const cita = await validarCitaExistente(citaId);

  // 2. Validar que la cita pertenece al barbero
  validarPerteneceBarbero(cita, barberoId, "confirmar esta cita");

  // 3. Validar estado (solo pendiente)
  validarEstadoCita(cita, ["pendiente"], "confirmar");

  // 4. Confirmar la cita
  const citaConfirmada = await citaRepository.updateEstado(
    citaId,
    "confirmada",
  );

  // 5. Notificar al cliente
  notificacionService
    .crear({
      usuarioId: cita.cliente_id,
      tipo: "cita_confirmada",
      titulo: "Cita confirmada",
      mensaje: `Tu cita del ${cita.fecha} a las ${cita.hora.slice(0, 5)} ha sido confirmada por el barbero`,
      data: { citaId },
    })
    .catch((err) =>
      console.error("[Notificacion] Error al notificar cliente:", err),
    );

  return citaConfirmada;
};
