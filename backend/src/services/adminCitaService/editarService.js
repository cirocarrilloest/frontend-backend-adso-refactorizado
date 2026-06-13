// backend/src/services/adminCitaService/editarService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import { userRepository } from "../../repositories/userRepository.js";
import {
  validarCitaExistente,
  validarFechaFutura,
  validarDisponibilidadHorario,
  huboCambioHorario,
  huboCambioBarbero,
} from "./helpers.js";

/**
 * EDITAR CITA COMO ADMINISTRADOR
 * @param {number} citaId - ID de la cita
 * @param {Object} campos - Campos a actualizar
 * @returns {Promise<Object>} Cita actualizada
 * @throws {NotFoundError} Si la cita no existe
 * @throws {ValidationError} Si la nueva fecha/hora no es válida
 * @throws {ConflictError} Si hay conflicto de horario
 *
 * Frontend: Panel Admin - Modal editar cita
 * - Componente: EditarCitaAdminModal
 * - Endpoint: PUT /api/citas/admin/:id
 *
 * Backend relacionado:
 * - citaRepository.findById
 * - citaRepository.update
 * - citaRepository.existsDuplicate (con exclusión)
 * - notificacionService.crear
 * - userRepository.findById (para nuevo barbero)
 */
export const editarCitaAdmin = async (citaId, campos) => {
  // 1. Validar que la cita existe
  const citaExistente = await validarCitaExistente(citaId);

  // 2. Preparar actualizaciones
  const updates = {};

  // 3. Validar fecha/hora si se están cambiando
  if (campos.fecha !== undefined || campos.hora !== undefined) {
    const nuevaFecha = campos.fecha || citaExistente.fecha;
    const nuevaHora = campos.hora || citaExistente.hora;
    const fechaNorm = await validarFechaFutura(nuevaFecha, nuevaHora);
    updates.fecha = fechaNorm;
    updates.hora = nuevaHora;
  }

  // 4. Determinar barbero y horario para validar disponibilidad
  const barberoId =
    campos.barbero_id !== undefined
      ? campos.barbero_id
      : citaExistente.barbero_id;
  const fecha = updates.fecha || citaExistente.fecha;
  const hora = updates.hora || citaExistente.hora;

  // 5. Validar disponibilidad si cambia barbero/fecha/hora
  if (
    campos.barbero_id !== undefined ||
    campos.fecha !== undefined ||
    campos.hora !== undefined
  ) {
    await validarDisponibilidadHorario(barberoId, fecha, hora, citaId);
  }

  // 6. Actualizar campos adicionales
  if (campos.barbero_id !== undefined) updates.barbero_id = campos.barbero_id;
  if (campos.servicio_id !== undefined)
    updates.servicio_id = campos.servicio_id;
  if (campos.estado !== undefined) updates.estado = campos.estado;
  if (campos.notas !== undefined) updates.notas = campos.notas;

  // 7. Aplicar actualización
  const citaActualizada = await citaRepository.update(citaId, updates);

  // 8. Notificar cambios de fecha/hora al cliente
  if (huboCambioHorario(campos, citaExistente)) {
    await notificacionService.crear({
      usuarioId: citaExistente.cliente_id,
      tipo: "cita_editada_admin",
      titulo: "Tu cita fue modificada",
      mensaje: `Tu cita ha sido modificada. Nueva fecha: ${updates.fecha || citaExistente.fecha} a las ${String(updates.hora || citaExistente.hora).slice(0, 5)}`,
      data: { citaId, cambios: campos },
    });
  }

  // 9. Notificar cambio de barbero
  if (huboCambioBarbero(campos, citaExistente)) {
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
    if (campos.barbero_id) {
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
  }

  return citaActualizada;
};
