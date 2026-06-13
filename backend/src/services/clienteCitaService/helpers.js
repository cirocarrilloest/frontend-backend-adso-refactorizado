// backend/src/services/clienteCitaService/helpers.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { userRepository } from "../../repositories/userRepository.js";
import { servicioRepository } from "../../repositories/servicioRepository.js";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../utils/errors.js";
import {
  validarFechaHoraFutura,
  normalizarFecha,
} from "../../utils/dateUtils.js";

/**
 * VALIDAR Y OBTENER BARBERO
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Object>} Barbero validado
 * @throws {ValidationError} Si el barbero no existe o no es válido
 *
 * Frontend: Selector de barbero al agendar
 * Backend relacionado: userRepository.findById
 */
export const validarBarbero = async (barberoId) => {
  const barbero = await userRepository.findById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    throw new ValidationError("El barbero seleccionado no es válido");
  }
  return barbero;
};

/**
 * VALIDAR Y OBTENER SERVICIO
 * @param {number} servicioId - ID del servicio
 * @returns {Promise<Object>} Servicio validado
 * @throws {ValidationError} Si el servicio no existe o no está activo
 *
 * Frontend: Selector de servicio al agendar
 * Backend relacionado: servicioRepository.findById
 */
export const validarServicio = async (servicioId) => {
  const servicio = await servicioRepository.findById(servicioId);
  if (!servicio || !servicio.activo) {
    throw new ValidationError("El servicio seleccionado no está disponible");
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
 * Frontend: Validación al agendar/reagendar
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
 * VALIDAR PERMISO DE CITA
 * @param {Object} cita - Cita a validar
 * @param {number} usuarioId - ID del usuario
 * @throws {ForbiddenError} Si no tiene permiso
 *
 * Frontend: Verificación de permisos
 * Backend relacionado: citaRepository.findById
 */
export const validarPermisoCita = (cita, usuarioId) => {
  if (cita.cliente_id !== usuarioId) {
    throw new ForbiddenError("No tienes permiso para realizar esta acción");
  }
};

/**
 * VALIDAR ESTADO DE CITA PARA MODIFICACIÓN
 * @param {Object} cita - Cita a validar
 * @param {Array} estadosPermitidos - Estados permitidos
 * @throws {BusinessRuleError} Si el estado no es permitido
 *
 * Frontend: Habilitar/deshabilitar botones según estado
 * Backend relacionado: Reglas de negocio
 */
export const validarEstadoCita = (cita, estadosPermitidos = ["pendiente"]) => {
  if (!estadosPermitidos.includes(cita.estado)) {
    throw new BusinessRuleError(
      `No se puede realizar esta acción en una cita en estado "${cita.estado}"`,
    );
  }
};

/**
 * VALIDAR DISPONIBILIDAD DE HORARIO
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @param {number} excludeCitaId - ID de cita a excluir (para reagendar)
 * @throws {ValidationError} Si no está en horario laboral
 * @throws {ConflictError} Si hay conflicto de horario
 *
 * Frontend: Validación en tiempo real
 * Backend relacionado: citaRepository
 */
export const validarDisponibilidadHorario = async (
  barberoId,
  fecha,
  hora,
  excludeCitaId = null,
) => {
  // Validar horario laboral
  const enHorario = await citaRepository.isWithinWorkingHours(
    barberoId,
    fecha,
    hora,
  );
  if (!enHorario) {
    throw new ValidationError(
      "El horario seleccionado está fuera de la jornada laboral del barbero",
    );
  }

  // Validar duplicado
  const duplicado = await citaRepository.existsDuplicate(
    barberoId,
    fecha,
    hora,
    excludeCitaId,
  );
  if (duplicado) {
    throw new ConflictError(
      "El barbero ya tiene una cita agendada en ese horario",
    );
  }
};

/**
 * VALIDAR Y OBTENER CITA EXISTENTE
 * @param {number} citaId - ID de la cita
 * @returns {Promise<Object>} Cita encontrada
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Detalle de cita
 * Backend relacionado: citaRepository.findById
 */
export const validarCitaExistente = async (citaId) => {
  const cita = await citaRepository.findById(citaId);
  if (!cita) {
    throw new NotFoundError("Cita");
  }
  return cita;
};
