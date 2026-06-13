// backend/src/services/adminCitaService/helpers.js
import { userRepository } from "../../repositories/userRepository.js";
import { servicioRepository } from "../../repositories/servicioRepository.js";
import { citaRepository } from "../../repositories/citaRepository.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";
import {
  validarFechaHoraFutura,
  normalizarFecha,
} from "../../utils/dateUtils.js";

/**
 * VALIDAR Y OBTENER CLIENTE
 * @param {number} clienteId - ID del cliente
 * @returns {Promise<Object>} Cliente validado
 * @throws {ValidationError} Si el cliente no existe o no es válido
 *
 * Frontend: Panel Admin - Seleccionar cliente al crear cita
 * Backend relacionado: userRepository.findById
 */
export const validarCliente = async (clienteId) => {
  const cliente = await userRepository.findById(clienteId);
  if (!cliente || cliente.rol !== "cliente") {
    throw new ValidationError(
      "Cliente no encontrado o no es un cliente válido",
    );
  }
  return cliente;
};

/**
 * VALIDAR Y OBTENER BARBERO
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Object>} Barbero validado
 * @throws {ValidationError} Si el barbero no existe
 *
 * Frontend: Panel Admin - Seleccionar barbero al crear cita
 * Backend relacionado: userRepository.findById
 */
export const validarBarbero = async (barberoId) => {
  const barbero = await userRepository.findById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    throw new ValidationError("Barbero no encontrado");
  }
  return barbero;
};

/**
 * VALIDAR Y OBTENER SERVICIO
 * @param {number} servicioId - ID del servicio
 * @returns {Promise<Object>} Servicio validado
 * @throws {ValidationError} Si el servicio no existe o no está activo
 *
 * Frontend: Panel Admin - Seleccionar servicio al crear cita
 * Backend relacionado: servicioRepository.findById
 */
export const validarServicio = async (servicioId) => {
  const servicio = await servicioRepository.findById(servicioId);
  if (!servicio || !servicio.activo) {
    throw new ValidationError("Servicio no encontrado o inactivo");
  }
  return servicio;
};

/**
 * VALIDAR FECHA Y HORA (no pasada)
 * @param {string} fecha - Fecha (YYYY-MM-DD)
 * @param {string} hora - Hora (HH:MM:SS)
 * @returns {Promise<string>} Fecha normalizada
 * @throws {ValidationError} Si la fecha/hora es pasada
 *
 * Frontend: Validación al crear/editar cita
 * Backend relacionado: dateUtils
 */
export const validarFechaFutura = async (fecha, hora) => {
  const fechaNorm = normalizarFecha(fecha);
  const errorFecha = validarFechaHoraFutura(fechaNorm, hora);
  if (errorFecha) {
    throw new ValidationError(errorFecha.message);
  }
  return fechaNorm;
};

/**
 * VALIDAR Y OBTENER CITA EXISTENTE
 * @param {number} citaId - ID de la cita
 * @returns {Promise<Object>} Cita encontrada
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Panel Admin - Editar cita
 * Backend relacionado: citaRepository.findById
 */
export const validarCitaExistente = async (citaId) => {
  const cita = await citaRepository.findById(citaId);
  if (!cita) {
    throw new NotFoundError("Cita");
  }
  return cita;
};

/**
 * VALIDAR DISPONIBILIDAD DE HORARIO (sin duplicados)
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @param {number|null} excludeCitaId - ID de cita a excluir
 * @throws {ConflictError} Si hay conflicto de horario
 *
 * Frontend: Validación al crear/editar cita
 * Backend relacionado: citaRepository.existsDuplicate
 */
export const validarDisponibilidadHorario = async (
  barberoId,
  fecha,
  hora,
  excludeCitaId = null,
) => {
  const duplicado = await citaRepository.existsDuplicate(
    barberoId,
    fecha,
    hora,
    excludeCitaId,
  );
  if (duplicado) {
    throw new ConflictError("El barbero ya tiene una cita en ese horario");
  }
};

/**
 * DETERMINAR SI HUBO CAMBIO DE HORARIO
 * @param {Object} campos - Campos a actualizar
 * @param {Object} citaExistente - Cita existente
 * @returns {boolean} True si cambió fecha u hora
 */
export const huboCambioHorario = (campos, citaExistente) => {
  return (
    (campos.fecha !== undefined && campos.fecha !== citaExistente.fecha) ||
    (campos.hora !== undefined && campos.hora !== citaExistente.hora)
  );
};

/**
 * DETERMINAR SI HUBO CAMBIO DE BARBERO
 * @param {Object} campos - Campos a actualizar
 * @param {Object} citaExistente - Cita existente
 * @returns {boolean} True si cambió el barbero
 */
export const huboCambioBarbero = (campos, citaExistente) => {
  return (
    campos.barbero_id !== undefined &&
    campos.barbero_id !== null &&
    campos.barbero_id !== citaExistente.barbero_id
  );
};
