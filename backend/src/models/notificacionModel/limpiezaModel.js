// backend/src/models/notificacionModel/limpiezaModel.js
import { getPool } from "../../config/db.js";

/**
 * ELIMINAR NOTIFICACIONES ANTIGUAS (más de 30 días)
 * @returns {Promise<number>} Cantidad de notificaciones eliminadas
 *
 * Frontend: No aplica (tarea de mantenimiento backend)
 * Backend relacionado: Cron job o tarea programada
 *
 * Uso típico:
 * - Ejecutar diariamente con cron job
 * - Mantener la base de datos limpia
 *
 * Ejemplo de cron job:
 * // Ejecutar todos los días a las 2 AM
 * cron.schedule('0 2 * * *', async () => {
 *   const eliminadas = await limpiarNotificacionesAntiguas();
 *   console.log(`Se eliminaron ${eliminadas} notificaciones antiguas`);
 * });
 */
export const limpiarNotificacionesAntiguas = async () => {
  const pool = getPool();
  const [result] = await pool.execute(
    `DELETE FROM notificaciones WHERE creada_en < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
  );
  return result.affectedRows;
};
