// backend/src/models/citaModel/queriesBarbero.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER CITAS DE UN BARBERO (con filtro opcional de fecha)
 * @param {number} barbero_id - ID del barbero
 * @param {string|null} fecha - Fecha opcional
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Panel barbero - Lista de citas
 * Backend relacionado: barberoCitaService.getCitasBarbero
 */
export const getCitasByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  let query = `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, s.nombre as servicio_nombre, s.duracion, s.precio
               FROM citas c 
               JOIN usuarios u ON c.cliente_id = u.id 
               JOIN servicios s ON c.servicio_id = s.id
               WHERE c.barbero_id = ?`;
  const params = [barbero_id];

  if (fecha) {
    query += " AND c.fecha = ?";
    params.push(fecha);
  }
  query += " ORDER BY c.fecha ASC, c.hora ASC";

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * OBTENER AGENDA DEL DÍA DE UN BARBERO
 * @param {number} barbero_id - ID del barbero
 * @param {string|null} fecha - Fecha (default: hoy)
 * @returns {Promise<Array>} Lista de citas del día
 *
 * Frontend: Agenda del día (barbero)
 * Backend relacionado: barberoCitaService.getAgendaDia
 */
export const getAgendaDiaByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  const fechaConsulta = fecha || new Date().toISOString().split("T")[0];

  const [rows] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c 
     JOIN usuarios u ON c.cliente_id = u.id 
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.barbero_id = ? AND c.fecha = ? AND c.estado NOT IN ('cancelada') 
     ORDER BY c.hora ASC`,
    [barbero_id, fechaConsulta],
  );
  return rows;
};

/**
 * OBTENER AGENDA DE LA SEMANA DE UN BARBERO
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @returns {Promise<Object>} Agenda agrupada por día
 *
 * Frontend: Vista semanal (barbero)
 * Backend relacionado: barberoCitaService.getAgendaSemana
 */
export const getCitasSemanaByBarbero = async (barbero_id, fecha_inicio) => {
  const pool = getPool();
  const inicio = new Date(fecha_inicio);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  const fecha_fin = fin.toISOString().split("T")[0];

  const [rows] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c 
     JOIN usuarios u ON c.cliente_id = u.id 
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.barbero_id = ? AND c.fecha BETWEEN ? AND ? AND c.estado NOT IN ('cancelada')
     ORDER BY c.fecha ASC, c.hora ASC`,
    [barbero_id, fecha_inicio, fecha_fin],
  );

  const agenda = {};
  rows.forEach((cita) => {
    const fecha = cita.fecha.toISOString
      ? cita.fecha.toISOString().split("T")[0]
      : cita.fecha;
    if (!agenda[fecha]) agenda[fecha] = [];
    agenda[fecha].push(cita);
  });

  return { agenda, fecha_inicio, fecha_fin };
};

/**
 * OBTENER RESUMEN DE CITAS POR ESTADO PARA UN BARBERO
 * @param {number} barbero_id - ID del barbero
 * @param {string|null} fecha_inicio - Fecha inicio
 * @param {string|null} fecha_fin - Fecha fin
 * @returns {Promise<Array>} Resumen por estado
 *
 * Frontend: Estadísticas del barbero
 * Backend relacionado: barberoCitaService.getResumenCitas
 */
export const getResumenCitasByBarbero = async (
  barbero_id,
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `SELECT c.estado, COUNT(*) as total, COALESCE(SUM(s.precio), 0) as ingreso_potencial
               FROM citas c 
               JOIN servicios s ON c.servicio_id = s.id 
               WHERE c.barbero_id = ?`;
  const params = [barbero_id];

  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }
  query += " GROUP BY c.estado";

  const [rows] = await pool.execute(query, params);
  return rows;
};
