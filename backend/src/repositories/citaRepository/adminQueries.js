// backend/src/repositories/citaRepository/adminQueries.js
import { getPool } from "../../config/db.js";

/**
 * BUSCAR TODAS LAS CITAS CON FILTROS Y PAGINACIÓN
 * @param {Object} filters - Filtros (estado, fecha_desde, fecha_hasta, barbero_id, cliente_id)
 * @param {Object} pagination - Paginación (page, limit)
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Panel Admin - Tabla de todas las citas
 * Backend relacionado: adminCitaService.getAllCitas
 */
export const findAll = async (filters = {}, pagination = {}) => {
  const pool = getPool();
  let query = `
    SELECT c.*,
           u.nombre as cliente_nombre, u.email as cliente_email,
           b.nombre as barbero_nombre,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN usuarios b ON c.barbero_id = b.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.estado) {
    query += " AND c.estado = ?";
    params.push(filters.estado);
  }
  if (filters.fecha_desde) {
    query += " AND c.fecha >= ?";
    params.push(filters.fecha_desde);
  }
  if (filters.fecha_hasta) {
    query += " AND c.fecha <= ?";
    params.push(filters.fecha_hasta);
  }
  if (filters.barbero_id) {
    query += " AND c.barbero_id = ?";
    params.push(filters.barbero_id);
  }
  if (filters.cliente_id) {
    query += " AND c.cliente_id = ?";
    params.push(filters.cliente_id);
  }

  query += " ORDER BY c.fecha DESC, c.hora DESC";

  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 15));
  const offset = (page - 1) * limit;

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * OBTENER CITAS CERCANAS (próximas)
 * @param {number} limite - Límite de resultados
 * @returns {Promise<Array>} Lista de citas próximas
 *
 * Frontend: Dashboard Admin - Notificaciones
 * Backend relacionado: adminCitaService.getCitasCercanas
 */
export const getCitasCercanas = async (limite = 5) => {
  const pool = getPool();
  const limiteNum = parseInt(limite);
  const [rows] = await pool.execute(
    `SELECT 
      c.id, c.fecha, c.hora, c.estado,
      u.nombre as cliente_nombre,
      b.nombre as barbero_nombre,
      s.nombre as servicio_nombre
     FROM citas c
     JOIN usuarios u ON c.cliente_id = u.id
     JOIN usuarios b ON c.barbero_id = b.id
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.fecha >= CURDATE() 
       AND c.estado IN ('pendiente', 'confirmada')
     ORDER BY c.fecha ASC, c.hora ASC
     LIMIT ${limiteNum}`,
  );
  return rows;
};
