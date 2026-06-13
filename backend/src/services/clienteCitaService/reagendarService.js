// backend/src/services/clienteCitaService/reagendarService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import {
  validarCitaExistente,
  validarPermisoCita,
  validarEstadoCita,
  validarFechaFutura,
  validarDisponibilidadHorario,
} from "./helpers.js";

/**
 * REAGENDAR CITA (cambiar fecha/hora)
 * @param {Object} params - Parámetros
 * @param {number} params.citaId - ID de la cita
 * @param {string} params.nuevaFecha - Nueva fecha (YYYY-MM-DD)
 * @param {string} params.nuevaHora - Nueva hora (HH:MM:SS)
 * @param {number} params.usuarioId - ID del usuario (cliente)
 * @returns {Promise<Object>} Cita reagendada
 * @throws {NotFoundError} Si la cita no existe
 * @throws {ForbiddenError} Si no tiene permiso
 * @throws {BusinessRuleError} Si la cita no está en estado pendiente
 * @throws {ValidationError} Si la nueva fecha/hora no es válida
 * @throws {ConflictError} Si hay conflicto de horario
 *
 * Frontend: Modal de reagendar cita
 * - Componente: ReagendarCitaModal
 * - Endpoint: PUT /api/citas/:id/reagendar
 *
 * Backend relacionado:
 * - citaRepository.findById
 * - citaRepository.update
 * - citaRepository.existsDuplicate (con exclusión)
 * - notificacionService.crear
 */
export const reagendar = async ({
  citaId,
  nuevaFecha,
  nuevaHora,
  usuarioId,
}) => {
  // 1. Validar que la cita existe
  const cita = await validarCitaExistente(citaId);

  // 2. Validar permiso
  validarPermisoCita(cita, usuarioId);

  // 3. Validar estado (solo pendiente)
  validarEstadoCita(cita, ["pendiente"]);

  // 4. Validar nueva fecha/hora (no pasada)
  const fechaNorm = await validarFechaFutura(nuevaFecha, nuevaHora);

  // 5. Validar disponibilidad del nuevo horario (excluyendo esta cita)
  await validarDisponibilidadHorario(
    cita.barbero_id,
    fechaNorm,
    nuevaHora,
    citaId,
  );

  // 6. Actualizar la cita
  const citaActualizada = await citaRepository.update(citaId, {
    fecha: fechaNorm,
    hora: nuevaHora,
  });

  // 7. Notificar al barbero del cambio
  notificacionService
    .crear({
      usuarioId: cita.barbero_id,
      tipo: "cita_reagendada",
      titulo: "Cita reagendada",
      mensaje: `La cita de ${cita.cliente_nombre} ha sido reagendada para el ${fechaNorm} a las ${nuevaHora}`,
      data: { citaId },
    })
    .catch((err) =>
      console.error("[Notificacion] Error al notificar barbero:", err),
    );

  return citaActualizada;
};
