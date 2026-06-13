// backend/src/repositories/citaRepository/disponibilidadQueries.js
import { getPool } from "../../config/db.js";
import { getDiaSemana } from "../../utils/dateUtils.js";

/**
 * VERIFICAR SI EXISTE CITA DUPLICADA
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @param {number|null} excludeId - ID a excluir
 * @returns {Promise<boolean>} True si existe duplicado
 *
 * Frontend: Validación al agendar
 * Backend relacionado: clienteCitaService.agendar, adminCitaService.crearCitaAdmin
 */
export const existsDuplicate = async (
  barberoId,
  fecha,
  hora,
  excludeId = null,
) => {
  const pool = getPool();
  let query = `
    SELECT id FROM citas
    WHERE barbero_id = ? AND fecha = ? AND hora = ?
    AND estado IN ('pendiente', 'confirmada')
  `;
  const params = [barberoId, fecha, hora];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await pool.execute(query, params);
  return rows.length > 0;
};

/**
 * OBTENER HORARIOS OCUPADOS DE UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @returns {Promise<Array>} Lista de horas ocupadas
 *
 * Frontend: Mostrar horarios no disponibles
 * Backend relacionado: barberoCitaService.getHorariosDisponibles
 */
export const getHorariosOcupados = async (barberoId, fecha) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT hora FROM citas
     WHERE barbero_id = ? AND fecha = ?
     AND estado IN ('pendiente', 'confirmada')
     ORDER BY hora`,
    [barberoId, fecha],
  );
  return rows.map((r) => r.hora);
};

/**
 * VERIFICAR SI HORARIO ESTÁ DENTRO DE JORNADA LABORAL
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @returns {Promise<boolean>} True si está en horario laboral
 *
 * Frontend: Validación al agendar
 * Backend relacionado: clienteCitaService.agendar
 */
export const isWithinWorkingHours = async (barberoId, fecha, hora) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const [rows] = await pool.execute(
    `SELECT hora_inicio, hora_fin
     FROM horarios_barbero
     WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
    [barberoId, diaSemana],
  );

  if (rows.length === 0) return false;

  const horaStr = String(hora).slice(0, 5);
  const inicio = String(rows[0].hora_inicio).slice(0, 5);
  const fin = String(rows[0].hora_fin).slice(0, 5);

  return horaStr >= inicio && horaStr < fin;
};

/**
 * OBTENER HORARIO DE BARBERO POR DÍA
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha
 * @returns {Promise<Object|null>} Horario del barbero
 *
 * Frontend: Mostrar horario del barbero
 * Backend relacionado: barberoCitaService.getHorariosDisponibles
 */
export const getHorarioByDay = async (barberoId, fecha) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const [rows] = await pool.execute(
    `SELECT hora_inicio, hora_fin 
     FROM horarios_barbero 
     WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
    [barberoId, diaSemana],
  );

  return rows[0] || null;
};
