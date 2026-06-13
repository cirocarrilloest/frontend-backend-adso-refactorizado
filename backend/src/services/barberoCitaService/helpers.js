// backend/src/services/barberoCitaService/helpers.js
import { citaRepository } from "../../repositories/citaRepository.js";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../utils/errors.js";
import { fechaHoyStr } from "../../utils/dateUtils.js";

/**
 * VALIDAR PERMISO DE BARBERO
 * @param {number} barberoId - ID del barbero de la cita/agenda
 * @param {number} usuarioId - ID del usuario autenticado
 * @param {string} usuarioRol - Rol del usuario
 * @param {string} accion - Acción que se intenta realizar (para el mensaje)
 * @throws {ForbiddenError} Si no tiene permiso
 *
 * Frontend: Verificar si el barbero puede ver/modificar la cita
 * Backend relacionado: Controladores de barbero
 */
export const validarPermisoBarbero = (
  barberoId,
  usuarioId,
  usuarioRol,
  accion = "realizar esta acción",
) => {
  if (usuarioRol === "barbero" && parseInt(barberoId) !== parseInt(usuarioId)) {
    throw new ForbiddenError(`No tienes permiso para ${accion}`);
  }
};

/**
 * VALIDAR Y OBTENER CITA EXISTENTE
 * @param {number} citaId - ID de la cita
 * @returns {Promise<Object>} Cita encontrada
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Detalle de cita, acciones sobre cita
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
 * VALIDAR QUE LA CITA PERTENEZCA AL BARBERO
 * @param {Object} cita - Cita a validar
 * @param {number} barberoId - ID del barbero
 * @param {string} accion - Acción que se intenta realizar
 * @throws {ForbiddenError} Si no pertenece
 *
 * Frontend: Verificar propiedad de la cita
 * Backend relacionado: Reglas de negocio
 */
export const validarPerteneceBarbero = (
  cita,
  barberoId,
  accion = "modificar esta cita",
) => {
  if (cita.barbero_id !== barberoId) {
    throw new ForbiddenError(`No tienes permiso para ${accion}`);
  }
};

/**
 * VALIDAR ESTADO DE CITA PARA UNA ACCIÓN
 * @param {Object} cita - Cita a validar
 * @param {Array} estadosPermitidos - Estados permitidos
 * @param {string} accion - Acción que se intenta realizar
 * @throws {BusinessRuleError} Si el estado no es permitido
 *
 * Frontend: Habilitar/deshabilitar botones según estado
 * Backend relacionado: Reglas de negocio
 */
export const validarEstadoCita = (cita, estadosPermitidos, accion) => {
  if (!estadosPermitidos.includes(cita.estado)) {
    throw new BusinessRuleError(
      `No se puede ${accion} una cita en estado "${cita.estado}"`,
    );
  }
};

/**
 * CALCULAR FECHA FIN DE SEMANA
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @returns {string} Fecha fin (7 días después)
 *
 * Frontend: Vista semanal
 * Backend relacionado: Agenda semanal
 */
export const calcularFechaFinSemana = (fechaInicio) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  return fin.toISOString().split("T")[0];
};

/**
 * AGRUPAR CITAS POR FECHA
 * @param {Array} citas - Lista de citas
 * @returns {Object} Objeto agrupado por fecha
 *
 * Frontend: Mostrar agenda agrupada
 * Backend relacionado: Agenda semanal
 */
export const agruparCitasPorFecha = (citas) => {
  const agenda = {};
  citas.forEach((cita) => {
    const fecha = cita.fecha;
    if (!agenda[fecha]) agenda[fecha] = [];
    agenda[fecha].push(cita);
  });
  return agenda;
};
