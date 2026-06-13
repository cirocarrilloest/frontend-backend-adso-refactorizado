// backend/src/repositories/citaRepository/consultasCliente.js
import { getPool } from "../../config/db.js";

/**
 * BUSCAR CITAS POR CLIENTE ID (con opciones de filtro)
 * @param {number} clienteId - ID del cliente
 * @param {Object} options - Opciones (estado, soloFuturas, orden, limite)
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Mis citas, próximas citas, historial
 * Backend relacionado: clienteCitaService.getMisCitas, getProximasCitas, getHistorialCitas
 */
export const findByClienteId = async (clienteId, options = {}) => {
  const pool = getPool();
  let query = `
    SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios b ON c.barbero_id = b.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.cliente_id = ?
  `;
  const params = [clienteId];

  if (options.estado) {
    query += " AND c.estado = ?";
    params.push(options.estado);
  }

  if (options.soloFuturas) {
    query += " AND c.fecha >= CURDATE()";
  }

  query += ` ORDER BY c.fecha ${options.orden || "DESC"}, c.hora ${options.orden || "DESC"}`;

  if (options.limite) {
    query += ` LIMIT ${parseInt(options.limite)}`;
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};
