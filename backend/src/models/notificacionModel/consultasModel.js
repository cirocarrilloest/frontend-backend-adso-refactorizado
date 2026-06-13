// backend/src/models/notificacionModel/consultasModel.js
import { getPool } from "../../config/db.js";
import { parsearData, normalizarLimite } from "./helpers.js";

/**
 * OBTENER NOTIFICACIONES DE UN USUARIO
 * @param {number} usuarioId - ID del usuario
 * @param {boolean} soloNoLeidas - Si solo se quieren las no leídas
 * @param {number} limite - Límite de resultados (max 100)
 * @returns {Promise<Array>} Lista de notificaciones
 *
 * Frontend:
 * - Campana de notificaciones (dropdown)
 * - Página de notificaciones
 * - Componentes: NotificacionesDropdown, NotificacionesList
 * - Endpoint: GET /api/notificaciones
 *
 * Backend relacionado: notificacionService.getByUsuario
 *
 * Ejemplo de respuesta:
 * [{
 *   id: 1,
 *   tipo: "cita_nueva",
 *   titulo: "Nueva cita agendada",
 *   mensaje: "Juan ha agendado un corte de cabello",
 *   data: { citaId: 123, cliente: "Juan" },
 *   leida: false,
 *   creada_en: "2024-01-01 10:00:00"
 * }]
 */
export const getNotificacionesByUsuario = async (
  usuarioId,
  soloNoLeidas = false,
  limite = 20,
) => {
  const pool = getPool();

  // Normalizar límite para evitar inyección SQL
  const limiteNumero = normalizarLimite(limite, 100, 20);

  let query = `
    SELECT id, tipo, titulo, mensaje, data, leida, creada_en
    FROM notificaciones
    WHERE usuario_id = ?
  `;
  const params = [usuarioId];

  if (soloNoLeidas) {
    query += ` AND leida = FALSE`;
  }

  // Usar template string para LIMIT (evita problemas con prepared statements)
  query += ` ORDER BY creada_en DESC LIMIT ${limiteNumero}`;

  const [rows] = await pool.execute(query, params);

  return rows.map((r) => ({
    ...r,
    data: parsearData(r.data),
  }));
};

/**
 * CONTAR NOTIFICACIONES NO LEÍDAS DE UN USUARIO
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<number>} Total de notificaciones no leídas
 *
 * Frontend:
 * - Badge del icono de notificaciones
 * - Actualización en tiempo real
 * - Componente: NotificacionesBadge
 * - Endpoint: GET /api/notificaciones/contar-no-leidas
 *
 * Backend relacionado: notificacionService.contarNoLeidas
 */
export const contarNoLeidas = async (usuarioId) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE`,
    [usuarioId],
  );
  return rows[0].total;
};
