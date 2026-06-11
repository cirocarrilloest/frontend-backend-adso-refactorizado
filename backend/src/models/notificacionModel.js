// backend/src/models/notificacionModel.js

import { getPool } from "../config/db.js";

/**
 * Crear una nueva notificación
 */
export const crearNotificacion = async (
  usuarioId,
  tipo,
  titulo,
  mensaje,
  data = null,
) => {
  const pool = getPool();
  const query = `
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, data, leida, creada_en)
    VALUES (?, ?, ?, ?, ?, FALSE, NOW())
  `;
  const [result] = await pool.execute(query, [
    usuarioId,
    tipo,
    titulo,
    mensaje,
    data ? JSON.stringify(data) : null,
  ]);
  return result.insertId;
};

/**
 * Obtener notificaciones de un usuario
 */
export const getNotificacionesByUsuario = async (
  usuarioId,
  soloNoLeidas = false,
  limite = 20,
) => {
  const pool = getPool();

  // VALIDACIÓN CRÍTICA: Asegurar que limite sea un número válido
  let limiteNumero = parseInt(limite, 10);

  // Si no es un número válido, usar valor por defecto
  if (isNaN(limiteNumero) || limiteNumero <= 0) {
    limiteNumero = 20;
  }

  // Limitar a máximo 100 registros
  if (limiteNumero > 100) {
    limiteNumero = 100;
  }

  // SOLUCIÓN: Usar template string para LIMIT (evita problemas con prepared statements)
  let query = `
    SELECT id, tipo, titulo, mensaje, data, leida, creada_en
    FROM notificaciones
    WHERE usuario_id = ?
  `;
  const params = [usuarioId];

  if (soloNoLeidas) {
    query += ` AND leida = FALSE`;
  }

  // IMPORTANTE: Usar template string para LIMIT, no como placeholder
  query += ` ORDER BY creada_en DESC LIMIT ${limiteNumero}`;

  const [rows] = await pool.execute(query, params);

  return rows.map((r) => ({
    ...r,
    data: typeof r.data === "string" ? JSON.parse(r.data) : r.data || null,
  }));
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (notificacionId, usuarioId) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?`,
    [notificacionId, usuarioId],
  );
  return result.affectedRows > 0;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasComoLeidas = async (usuarioId) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE`,
    [usuarioId],
  );
  return result.affectedRows;
};

/**
 * Contar notificaciones no leídas
 */
export const contarNoLeidas = async (usuarioId) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE`,
    [usuarioId],
  );
  return rows[0].total;
};

/**
 * Eliminar notificaciones antiguas (más de 30 días)
 */
export const limpiarNotificacionesAntiguas = async () => {
  const pool = getPool();
  const [result] = await pool.execute(
    `DELETE FROM notificaciones WHERE creada_en < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
  );
  return result.affectedRows;
};

export default {
  crearNotificacion,
  getNotificacionesByUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  contarNoLeidas,
  limpiarNotificacionesAntiguas,
};
