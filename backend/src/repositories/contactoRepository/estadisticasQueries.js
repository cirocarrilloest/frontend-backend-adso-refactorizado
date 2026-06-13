// backend/src/repositories/contactoRepository/estadisticasQueries.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER ESTADÍSTICAS DE MENSAJES
 * @returns {Promise<Object>} Estadísticas completas
 *
 * Frontend: Dashboard Admin - Tarjetas de mensajes
 * - Componente: MensajesStatsCards
 * - Endpoint: GET /api/contacto/estadisticas
 *
 * Backend relacionado: contactoController.getEstadisticas
 */
export const getEstadisticas = async () => {
  const pool = getPool();

  // Totales generales
  const [totales] = await pool.execute(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN leido = FALSE THEN 1 ELSE 0 END) as no_leidos,
      SUM(CASE WHEN respondido = FALSE THEN 1 ELSE 0 END) as no_respondidos,
      SUM(CASE WHEN DATE(fecha) = CURDATE() THEN 1 ELSE 0 END) as hoy
     FROM contacto_mensajes`,
  );

  // Tendencia por mes (últimos 6 meses)
  const [porMes] = await pool.execute(
    `SELECT 
      DATE_FORMAT(fecha, '%Y-%m') as mes,
      COUNT(*) as total
     FROM contacto_mensajes
     WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(fecha, '%Y-%m')
     ORDER BY mes ASC`,
  );

  // Tasa de respuesta
  const [tasaRespuesta] = await pool.execute(
    `SELECT 
      ROUND(SUM(CASE WHEN respondido = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje
     FROM contacto_mensajes
     WHERE leido = TRUE`,
  );

  // Tiempo promedio de respuesta (en horas)
  const [tiempoPromedio] = await pool.execute(
    `SELECT 
      ROUND(AVG(TIMESTAMPDIFF(HOUR, fecha, fecha_respuesta)), 1) as horas_promedio
     FROM contacto_mensajes
     WHERE respondido = TRUE AND fecha_respuesta IS NOT NULL`,
  );

  return {
    total: totales[0]?.total || 0,
    no_leidos: totales[0]?.no_leidos || 0,
    no_respondidos: totales[0]?.no_respondidos || 0,
    hoy: totales[0]?.hoy || 0,
    tendencia: porMes,
    tasa_respuesta: parseFloat(tasaRespuesta[0]?.porcentaje) || 0,
    tiempo_respuesta_promedio_horas:
      parseFloat(tiempoPromedio[0]?.horas_promedio) || 0,
  };
};
