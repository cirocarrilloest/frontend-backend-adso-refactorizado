// backend/src/models/citaModel/queriesCliente.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER TODAS LAS CITAS DE UN CLIENTE
 * @param {number} cliente_id - ID del cliente
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Mis citas (cliente)
 * Backend relacionado: clienteCitaService.getMisCitas
 */
export const getCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c
     JOIN usuarios b ON c.barbero_id = b.id
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.cliente_id = ?
     ORDER BY c.fecha DESC, c.hora DESC`,
    [cliente_id],
  );
  return rows;
};

/**
 * OBTENER CITAS PRÓXIMAS DE UN CLIENTE (pendientes y confirmadas, fecha >= hoy)
 * @param {number} cliente_id - ID del cliente
 * @returns {Promise<Array>} Lista de citas próximas
 *
 * Frontend: Dashboard cliente - Próximas citas
 * Backend relacionado: clienteCitaService.getProximasCitas
 */
export const getProximasCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c 
     JOIN usuarios b ON c.barbero_id = b.id 
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.cliente_id = ? 
       AND c.estado IN ('pendiente', 'confirmada') 
       AND c.fecha >= CURDATE()
     ORDER BY c.fecha ASC, c.hora ASC`,
    [cliente_id],
  );
  return rows;
};

/**
 * OBTENER HISTORIAL DE CITAS DE UN CLIENTE (completadas y canceladas)
 * @param {number} cliente_id - ID del cliente
 * @param {number} limite - Límite de resultados
 * @returns {Promise<Array>} Lista de citas históricas
 *
 * Frontend: Historial de citas (cliente)
 * Backend relacionado: clienteCitaService.getHistorialCitas
 */
export const getHistorialCitasByCliente = async (cliente_id, limite = 10) => {
  const pool = getPool();
  const clienteIdNum = parseInt(cliente_id);
  let limiteNum = parseInt(limite);
  if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 10;
  if (limiteNum > 100) limiteNum = 100;

  const [rows] = await pool.execute(
    `SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c 
     JOIN usuarios b ON c.barbero_id = b.id 
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.cliente_id = ? 
       AND c.estado IN ('completada', 'cancelada')
     ORDER BY c.fecha DESC, c.hora DESC 
     LIMIT ${limiteNum}`,
    [clienteIdNum],
  );
  return rows;
};
