// backend/src/models/citaModel/queriesEstadisticas.js
import { getPool } from "../../config/db.js";

/**
 * REPORTE DE INGRESOS POR PERIODO
 * @param {string} periodo - 'dia', 'mes', 'año'
 * @param {string} fecha_inicio - Fecha inicio
 * @param {string} fecha_fin - Fecha fin
 * @returns {Promise<Array>} Datos del reporte
 *
 * Frontend: Gráfico de ingresos (Admin)
 * Backend relacionado: adminCitaService.getReporteIngresos
 */
export const getReporteIngresos = async (periodo, fecha_inicio, fecha_fin) => {
  const pool = getPool();

  let groupBy;
  let selectPeriodo;

  switch (periodo) {
    case "dia":
      groupBy = "c.fecha";
      selectPeriodo = "c.fecha";
      break;
    case "mes":
      groupBy = "DATE_FORMAT(c.fecha, '%Y-%m')";
      selectPeriodo = "DATE_FORMAT(c.fecha, '%Y-%m')";
      break;
    case "año":
      groupBy = "YEAR(c.fecha)";
      selectPeriodo = "YEAR(c.fecha)";
      break;
    default:
      groupBy = "DATE_FORMAT(c.fecha, '%Y-%m')";
      selectPeriodo = "DATE_FORMAT(c.fecha, '%Y-%m')";
  }

  const [rows] = await pool.execute(
    `SELECT 
      ${selectPeriodo} as periodo,
      COUNT(c.id) as total_citas,
      SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas,
      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
      SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) as citas_confirmadas,
      SUM(CASE WHEN c.estado = 'pendiente' THEN 1 ELSE 0 END) as citas_pendientes,
      COALESCE(SUM(CASE WHEN c.estado = 'completada' THEN s.precio ELSE 0 END), 0) as ingreso_total,
      COALESCE(AVG(CASE WHEN c.estado = 'completada' THEN s.precio ELSE NULL END), 0) as ticket_promedio
    FROM citas c
    INNER JOIN servicios s ON c.servicio_id = s.id
    WHERE c.fecha BETWEEN ? AND ?
    GROUP BY ${groupBy}
    ORDER BY periodo DESC`,
    [fecha_inicio, fecha_fin],
  );
  return rows;
};

/**
 * SERVICIOS MÁS SOLICITADOS
 * @param {string|null} fecha_inicio - Fecha inicio
 * @param {string|null} fecha_fin - Fecha fin
 * @param {number} limite - Límite de resultados
 * @returns {Promise<Array>} Servicios top
 *
 * Frontend: Gráfico de servicios populares (Admin)
 * Backend relacionado: adminCitaService.getServiciosTop
 */
export const getServiciosMasSolicitados = async (
  fecha_inicio = null,
  fecha_fin = null,
  limite = 5,
) => {
  const pool = getPool();
  const limiteNum = Math.min(Math.max(parseInt(limite) || 5, 1), 50);

  let query = `SELECT s.id, s.nombre, s.precio, s.duracion, 
                      COUNT(c.id) as total_citas, 
                      COALESCE(SUM(s.precio), 0) as ingreso_generado
               FROM servicios s 
               INNER JOIN citas c ON s.id = c.servicio_id 
               WHERE c.estado = 'completada'`;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }

  query += ` GROUP BY s.id ORDER BY total_citas DESC LIMIT ${limiteNum}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * CLIENTES MÁS FRECUENTES
 * @param {string|null} fecha_inicio - Fecha inicio
 * @param {string|null} fecha_fin - Fecha fin
 * @param {number} limite - Límite de resultados
 * @returns {Promise<Array>} Clientes top
 *
 * Frontend: Tabla de clientes frecuentes (Admin)
 * Backend relacionado: adminCitaService.getClientesTop
 */
export const getClientesMasFrecuentes = async (
  fecha_inicio = null,
  fecha_fin = null,
  limite = 10,
) => {
  const pool = getPool();
  const limiteNum = Math.min(Math.max(parseInt(limite) || 10, 1), 100);

  let query = `SELECT u.id, u.nombre, u.email, u.telefono, 
                      COUNT(c.id) as total_citas,
                      COALESCE(SUM(s.precio), 0) as total_gastado, 
                      COALESCE(AVG(s.precio), 0) as ticket_promedio
               FROM usuarios u 
               JOIN citas c ON u.id = c.cliente_id 
               JOIN servicios s ON c.servicio_id = s.id
               WHERE c.estado = 'completada'`;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }

  query += ` GROUP BY u.id ORDER BY total_citas DESC LIMIT ${limiteNum}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * DISTRIBUCIÓN DE CITAS POR HORA
 * @param {string|null} fecha_inicio - Fecha inicio
 * @param {string|null} fecha_fin - Fecha fin
 * @returns {Promise<Array>} Distribución horaria
 *
 * Frontend: Heatmap de horas (Admin)
 * Backend relacionado: adminCitaService.getDistribucionHoraria
 */
export const getDistribucionCitasPorHora = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `
    SELECT 
      HOUR(c.hora) as hora,
      COUNT(*) as total_citas,
      SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
      SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
      SUM(CASE WHEN c.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
    FROM citas c
    WHERE 1=1
  `;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }

  query += " GROUP BY HOUR(c.hora) ORDER BY hora ASC";

  const [rows] = await pool.execute(query, params);

  // Completar horas faltantes (de 8 a 20)
  const horasCompletas = {};
  for (let i = 8; i <= 20; i++) {
    horasCompletas[i] = {
      hora: i,
      total_citas: 0,
      completadas: 0,
      canceladas: 0,
      confirmadas: 0,
      pendientes: 0,
    };
  }

  rows.forEach((row) => {
    horasCompletas[row.hora] = row;
  });

  return Object.values(horasCompletas);
};

/**
 * TASA DE CANCELACIÓN POR BARBERO
 * @param {string|null} fecha_inicio - Fecha inicio
 * @param {string|null} fecha_fin - Fecha fin
 * @returns {Promise<Array>} Tasa de cancelación por barbero
 *
 * Frontend: Reporte de cancelaciones (Admin)
 * Backend relacionado: adminCitaService.getTasaCancelacionPorBarbero
 */
export const getTasaCancelacionPorBarbero = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `SELECT u.id, u.nombre, 
                      COUNT(c.id) as total_citas,
                      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
                      ROUND((SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) / COUNT(c.id)) * 100, 2) as tasa_cancelacion
               FROM usuarios u 
               JOIN citas c ON u.id = c.barbero_id 
               WHERE u.rol = 'barbero'`;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }

  query += " GROUP BY u.id ORDER BY tasa_cancelacion DESC";

  const [rows] = await pool.execute(query, params);
  return rows;
};
