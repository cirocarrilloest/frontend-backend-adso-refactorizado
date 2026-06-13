// backend/src/repositories/citaRepository/consultasBarbero.js
import { getPool } from "../../config/db.js";

/**
 * BUSCAR CITAS POR BARBERO Y FECHA
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha (YYYY-MM-DD)
 * @param {string|null} estado - Estado opcional
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Agenda del día (barbero)
 * Backend relacionado: barberoCitaService.getAgendaDia
 */
export const findByBarberoAndDate = async (barberoId, fecha, estado = null) => {
  const pool = getPool();
  let query = `
    SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.barbero_id = ? AND c.fecha = ?
  `;
  const params = [barberoId, fecha];

  if (estado) {
    query += " AND c.estado = ?";
    params.push(estado);
  }

  query += " ORDER BY c.hora ASC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * BUSCAR CITAS POR BARBERO Y RANGO DE FECHAS
 * @param {number} barberoId - ID del barbero
 * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Agenda semanal (barbero)
 * Backend relacionado: barberoCitaService.getAgendaSemana
 */
export const findByBarberoAndDateRange = async (
  barberoId,
  fechaInicio,
  fechaFin,
) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email,
            s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c
     JOIN usuarios u ON c.cliente_id = u.id
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.barbero_id = ? AND c.fecha BETWEEN ? AND ?
     ORDER BY c.fecha ASC, c.hora ASC`,
    [barberoId, fechaInicio, fechaFin],
  );
  return rows;
};
