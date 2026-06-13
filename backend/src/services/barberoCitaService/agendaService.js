// backend/src/services/barberoCitaService/agendaService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { fechaHoyStr } from "../../utils/dateUtils.js";
import {
  validarPermisoBarbero,
  calcularFechaFinSemana,
  agruparCitasPorFecha,
} from "./helpers.js";

/**
 * OBTENER AGENDA DEL DÍA DE UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @param {string|null} fecha - Fecha específica (opcional)
 * @param {number} usuarioId - ID del usuario autenticado
 * @param {string} usuarioRol - Rol del usuario
 * @returns {Promise<Object>} Agenda del día con citas
 * @throws {ForbiddenError} Si no tiene permiso
 *
 * Frontend: Panel barbero - Agenda del día
 * - Componente: AgendaDiaCalendar
 * - Endpoint: GET /api/citas/agenda-dia?fecha=YYYY-MM-DD
 *
 * Backend relacionado:
 * - citaRepository.findByBarberoAndDate
 * - validarPermisoBarbero
 */
export const getAgendaDia = async (
  barberoId,
  fecha = null,
  usuarioId,
  usuarioRol,
) => {
  const fechaConsulta = fecha || fechaHoyStr();

  // Validar permisos
  validarPermisoBarbero(
    barberoId,
    usuarioId,
    usuarioRol,
    "ver la agenda de otro barbero",
  );

  const citas = await citaRepository.findByBarberoAndDate(
    barberoId,
    fechaConsulta,
  );

  return {
    fecha: fechaConsulta,
    citas,
    total_citas: citas.length,
  };
};

/**
 * OBTENER AGENDA SEMANAL DE UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {number} usuarioId - ID del usuario autenticado
 * @param {string} usuarioRol - Rol del usuario
 * @returns {Promise<Object>} Agenda semanal agrupada por día
 * @throws {ForbiddenError} Si no tiene permiso
 *
 * Frontend: Panel barbero - Vista semanal
 * - Componente: AgendaSemanaView
 * - Endpoint: GET /api/citas/barbero/:id/semana?fecha_inicio=YYYY-MM-DD
 *
 * Backend relacionado:
 * - citaRepository.findByBarberoAndDateRange
 * - validarPermisoBarbero
 */
export const getAgendaSemana = async (
  barberoId,
  fechaInicio,
  usuarioId,
  usuarioRol,
) => {
  // Validar permisos
  validarPermisoBarbero(
    barberoId,
    usuarioId,
    usuarioRol,
    "ver la agenda de otro barbero",
  );

  // Calcular fecha fin
  const fechaFin = calcularFechaFinSemana(fechaInicio);

  // Obtener citas del rango
  const citas = await citaRepository.findByBarberoAndDateRange(
    barberoId,
    fechaInicio,
    fechaFin,
  );

  // Agrupar por fecha
  const agenda = agruparCitasPorFecha(citas);

  // ✅ CORREGIDO: Añadir total_citas y barbero_id
  return {
    agenda,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    total_citas: citas.length, // ← AÑADIR ESTA LÍNEA
    barbero_id: parseInt(barberoId), // ← OPCIONAL: útil para debugging
  };
};
