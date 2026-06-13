// backend/src/models/notificacionModel/estadoModel.js
import { getPool } from "../../config/db.js";

/**
 * MARCAR UNA NOTIFICACIÓN COMO LEÍDA
 * @param {number} notificacionId - ID de la notificación
 * @param {number} usuarioId - ID del usuario (para verificar propiedad)
 * @returns {Promise<boolean>} True si se marcó correctamente
 *
 * Frontend:
 * - Al hacer clic en una notificación
 * - Al abrir el dropdown de notificaciones
 * - Componente: NotificacionItem
 * - Endpoint: PATCH /api/notificaciones/:id/leida
 *
 * Backend relacionado: notificacionService.marcarLeida
 *
 * Seguridad: Se verifica que la notificación pertenezca al usuario
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
 * MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<number>} Cantidad de notificaciones marcadas
 *
 * Frontend:
 * - Botón "Marcar todas como leídas"
 * - Componente: MarcarTodasLeidasButton
 * - Endpoint: PATCH /api/notificaciones/marcar-todas-leidas
 *
 * Backend relacionado: notificacionService.marcarTodasLeidas
 */
export const marcarTodasComoLeidas = async (usuarioId) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE`,
    [usuarioId],
  );
  return result.affectedRows;
};
