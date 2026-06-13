// backend/src/services/citaService/helpers.js
import userRepository from "../../repositories/userRepository.js";
import servicioRepository from "../../repositories/servicioRepository.js";
import {
  validarFechaHoraFutura,
  normalizarFecha,
} from "../../utils/dateUtils.js";

/**
 * Verificar que el barbero existe y es válido
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<{barbero: Object, error: string|null}>}
 *
 * Frontend: Usado al agendar cita (selector de barbero)
 * Backend relacionado: userRepository.findById
 */
export const verificarBarbero = async (barberoId) => {
  const barbero = await userRepository.findById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    return { error: "El barbero seleccionado no es válido" };
  }
  return { barbero };
};

/**
 * Verificar que el servicio existe y está activo
 * @param {number} servicioId - ID del servicio
 * @returns {Promise<{servicio: Object, error: string|null}>}
 *
 * Frontend: Usado al agendar cita (selector de servicio)
 * Backend relacionado: servicioRepository.findById
 */
export const verificarServicio = async (servicioId) => {
  const servicio = await servicioRepository.findById(servicioId);
  if (!servicio || !servicio.activo) {
    return { error: "El servicio seleccionado no está disponible" };
  }
  return { servicio };
};

/**
 * Validar fecha y hora de cita
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM:SS o HH:MM
 * @returns {Promise<{fechaNorm: string, error: string|null}>}
 *
 * Frontend: Validación en formulario de agendar/reagendar
 */
export const validarFechaCita = async (fecha, hora) => {
  const fechaNorm = normalizarFecha(fecha);
  const errorFecha = validarFechaHoraFutura(fechaNorm, hora);
  if (errorFecha) {
    return { error: errorFecha.message };
  }
  return { fechaNorm };
};

/**
 * Verificar disponibilidad del horario
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @param {number} citaIdExcluir - ID de cita a excluir (para edición)
 * @returns {Promise<boolean>}
 *
 * Frontend: Verificar disponibilidad en tiempo real
 * Backend relacionado: citaModel.verificarDuplicado, citaModel.verificarHorarioLaboral
 */
export const verificarDisponibilidadHorario = async (
  barberoId,
  fecha,
  hora,
  citaIdExcluir = null,
) => {
  const { citaModel } = await import("../../models/citaModel.js");
  const duplicado = await citaModel.verificarDuplicado(
    barberoId,
    fecha,
    hora,
    citaIdExcluir,
  );
  return !duplicado;
};

/**
 * Verificar horario laboral del barbero
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @returns {Promise<boolean>}
 */
export const verificarHorarioLaboral = async (barberoId, fecha, hora) => {
  const { citaModel } = await import("../../models/citaModel.js");
  return await citaModel.verificarHorarioLaboral(barberoId, fecha, hora);
};
