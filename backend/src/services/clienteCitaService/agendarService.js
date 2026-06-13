// backend/src/services/clienteCitaService/agendarService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import {
  validarBarbero,
  validarServicio,
  validarFechaFutura,
  validarDisponibilidadHorario,
} from "./helpers.js";

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
 * @returns {Promise<Object>} Cita creada
 * @throws {ValidationError} Si falla alguna validación
 * @throws {ConflictError} Si hay conflicto de horario
 *
 * Frontend: Formulario de agendar cita
 * - Componente: AgendarCitaForm
 * - Endpoint: POST /api/citas
 *
 * Backend relacionado:
 * - userRepository.findById
 * - servicioRepository.findById
 * - citaRepository.isWithinWorkingHours
 * - citaRepository.existsDuplicate
 * - citaRepository.create
 * - notificacionService.crear
 */
export const agendar = async ({
  clienteId,
  barberoId,
  servicioId,
  fecha,
  hora,
  notas,
  clienteNombre,
}) => {
  // 1. Validar fecha/hora (no pasada)
  const fechaNorm = await validarFechaFutura(fecha, hora);

  // 2. Validar barbero
  const barbero = await validarBarbero(barberoId);

  // 3. Validar servicio
  const servicio = await validarServicio(servicioId);

  // 4. Validar disponibilidad (horario laboral + sin duplicado)
  await validarDisponibilidadHorario(barberoId, fechaNorm, hora);

  // 5. Crear la cita
  const nuevaCita = await citaRepository.create({
    cliente_id: clienteId,
    barbero_id: barberoId,
    servicio_id: servicioId,
    fecha: fechaNorm,
    hora,
    notas,
    estado: "pendiente",
  });

  // 6. Notificar al barbero (fire-and-forget, no bloquea la respuesta)
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
    .catch((err) =>
      console.error("[Notificacion] Error al notificar barbero:", err),
    );

  return nuevaCita;
};
