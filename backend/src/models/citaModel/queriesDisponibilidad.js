// backend/src/models/citaModel/queriesDisponibilidad.js
import { getPool } from "../../config/db.js";
import { getDiaSemana } from "../../utils/dateUtils.js";

/**
 * VERIFICAR DISPONIBILIDAD DE UN HORARIO
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @returns {Promise<boolean>} True si está disponible
 *
 * Frontend: Validación al agendar cita
 * Backend relacionado: citaService.agendarCita
 */
export const verificarDisponibilidad = async (barbero_id, fecha, hora) => {
  const enHorario = await verificarHorarioLaboral(barbero_id, fecha, hora);
  if (!enHorario) return false;

  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT COUNT(*) as count FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')",
    [barbero_id, fecha, hora],
  );
  return rows[0].count === 0;
};

/**
 * VERIFICAR SI UN HORARIO ESTÁ DENTRO DE LA JORNADA LABORAL DEL BARBERO
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @returns {Promise<boolean>} True si está en horario laboral
 *
 * Frontend: Validación al agendar cita
 * Backend relacionado: citaService.agendarCita
 */
export const verificarHorarioLaboral = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const [rows] = await pool.execute(
    "SELECT hora_inicio, hora_fin FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE",
    [barbero_id, diaSemana],
  );

  if (rows.length === 0) return false;

  const horaStr = hora.substring(0, 5);
  return (
    horaStr >= String(rows[0].hora_inicio).substring(0, 5) &&
    horaStr < String(rows[0].hora_fin).substring(0, 5)
  );
};

/**
 * OBTENER HORARIOS OCUPADOS DE UN BARBERO EN UNA FECHA
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha - Fecha
 * @returns {Promise<Array>} Lista de horas ocupadas
 *
 * Frontend: Mostrar horarios no disponibles
 * Backend relacionado: disponibilidadService.getHorariosDisponibles
 */
export const getHorariosOcupados = async (barbero_id, fecha) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT hora FROM citas WHERE barbero_id = ? AND fecha = ? AND estado IN ('pendiente', 'confirmada') ORDER BY hora",
    [barbero_id, fecha],
  );
  return rows.map((r) => r.hora);
};

/**
 * OBTENER HORARIOS DISPONIBLES DE UN BARBERO
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha - Fecha
 * @param {number} duracionSlot - Duración del slot en minutos
 * @returns {Promise<Array>} Lista de horarios disponibles
 *
 * Frontend: Selector de horarios al agendar
 * Backend relacionado: disponibilidadService.getHorariosDisponibles
 */
export const getHorariosDisponibles = async (
  barbero_id,
  fecha,
  duracionSlot = 30,
) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const [horario] = await pool.execute(
    "SELECT hora_inicio, hora_fin FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE",
    [barbero_id, diaSemana],
  );

  if (horario.length === 0) return [];

  // Generar slots según duración
  const slots = [];
  let actual = new Date(`2000-01-01T${horario[0].hora_inicio}`);
  const fin = new Date(`2000-01-01T${horario[0].hora_fin}`);

  while (actual < fin) {
    slots.push(actual.toTimeString().slice(0, 5));
    actual.setMinutes(actual.getMinutes() + duracionSlot);
  }

  const ocupados = await getHorariosOcupados(barbero_id, fecha);
  const ocupadosSet = new Set(ocupados.map((h) => h.substring(0, 5)));

  return slots.filter((s) => !ocupadosSet.has(s));
};

/**
 * OBTENER HORARIO DE BARBERO PARA UN DÍA ESPECÍFICO
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha - Fecha
 * @returns {Promise<Object|null>} Horario del barbero
 *
 * Frontend: Ver horario del barbero
 * Backend relacionado: disponibilidadService.getHorariosDisponibles
 */
export const getHorarioBarberoPorDia = async (barbero_id, fecha) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const [rows] = await pool.execute(
    `SELECT hora_inicio, hora_fin, activo 
     FROM horarios_barbero 
     WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
    [barbero_id, diaSemana],
  );

  return rows[0] || null;
};
