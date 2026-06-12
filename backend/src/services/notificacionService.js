// backend/src/services/notificacionService.js
import { getPool } from "../config/db.js";

/**
 * Servicio de notificaciones
 * Responsabilidad: Crear y gestionar notificaciones
 */
export const notificacionService = {
  /**
   * Crear una nueva notificación
   */
  async crear({ usuarioId, tipo, titulo, mensaje, data = null }) {
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
  },

  /**
   * Obtener notificaciones de un usuario
   */
  async getByUsuario(usuarioId, soloNoLeidas = false, limite = 20) {
    const pool = getPool();
    let limiteNumero = Math.min(Math.max(parseInt(limite) || 20, 1), 100);

    let query = `
      SELECT id, tipo, titulo, mensaje, data, leida, creada_en
      FROM notificaciones
      WHERE usuario_id = ?
    `;
    const params = [usuarioId];

    if (soloNoLeidas) {
      query += ` AND leida = FALSE`;
    }

    query += ` ORDER BY creada_en DESC LIMIT ${limiteNumero}`;

    const [rows] = await pool.execute(query, params);
    return rows.map((r) => ({
      ...r,
      data: typeof r.data === "string" ? JSON.parse(r.data) : r.data || null,
    }));
  },

  /**
   * Marcar notificación como leída
   */
  async marcarLeida(notificacionId, usuarioId) {
    const pool = getPool();
    const [result] = await pool.execute(
      `UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?`,
      [notificacionId, usuarioId],
    );
    return result.affectedRows > 0;
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasLeidas(usuarioId) {
    const pool = getPool();
    const [result] = await pool.execute(
      `UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE`,
      [usuarioId],
    );
    return result.affectedRows;
  },

  /**
   * Contar notificaciones no leídas
   */
  async contarNoLeidas(usuarioId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE`,
      [usuarioId],
    );
    return rows[0].total;
  },
};

export default notificacionService;
