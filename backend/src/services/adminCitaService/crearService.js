// backend/src/services/adminCitaService/crearService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { notificacionService } from "../notificacionService.js";
import {
  validarCliente,
  validarBarbero,
  validarServicio,
  validarFechaFutura,
  validarDisponibilidadHorario,
} from "./helpers.js";

/**
 * CREAR CITA COMO ADMINISTRADOR
 * @param {Object} params - Parámetros
 * @param {number} params.clienteId - ID del cliente
 * @param {number} params.barberoId - ID del barbero
 * @param {number} params.servicioId - ID del servicio
 * @param {string} params.fecha - Fecha (YYYY-MM-DD)
 * @param {string} params.hora - Hora (HH:MM:SS)
 * @param {string} params.notas - Notas opcionales
 * @returns {Promise<Object>} Cita creada
 * @throws {ValidationError} Si falla alguna validación
 * @throws {ConflictError} Si hay conflicto de horario
 *
 * Frontend: Panel Admin - Formulario crear cita
 * - Componente: CrearCitaAdminForm
 * - Endpoint: POST /api/citas/admin/crear
 *
 * Backend relacionado:
 * - userRepository.findById (cliente, barbero)
 * - servicioRepository.findById
 * - citaRepository.existsDuplicate
 * - citaRepository.create
 * - notificacionService.crear (doble: cliente y barbero)
 */
export const crearCitaAdmin = async ({
  clienteId,
  barberoId,
  servicioId,
  fecha,
  hora,
  notas,
}) => {
  // 1. Validar cliente
  const cliente = await validarCliente(clienteId);

  // 2. Validar barbero
  const barbero = await validarBarbero(barberoId);

  // 3. Validar servicio
  const servicio = await validarServicio(servicioId);

  // 4. Validar fecha/hora (no pasada)
  const fechaNorm = await validarFechaFutura(fecha, hora);

  // 5. Validar disponibilidad (sin duplicado)
  await validarDisponibilidadHorario(barberoId, fechaNorm, hora);

  // 6. Crear la cita (confirmada directamente)
  const citaCreada = await citaRepository.create({
    cliente_id: clienteId,
    barbero_id: barberoId,
    servicio_id: servicioId,
    fecha: fechaNorm,
    hora,
    notas,
    estado: "confirmada",
  });

  // 7. Notificar al cliente y al barbero
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
};
