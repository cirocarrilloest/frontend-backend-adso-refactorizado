// backend/src/services/adminCitaService/estadisticasService.js
import { citaRepository } from "../../repositories/citaRepository.js";

/**
 * OBTENER ESTADÍSTICAS DEL DASHBOARD
 * @returns {Promise<Object>} Estadísticas completas del dashboard
 *
 * Frontend: Dashboard Admin - Tarjetas y gráficos principales
 * - Componente: DashboardStats, DashboardCards
 * - Endpoint: GET /api/citas/dashboard
 *
 * Backend relacionado: citaRepository.getDashboardStats
 */
export const getDashboardStats = async () => {
  return citaRepository.getDashboardStats();
};

/**
 * OBTENER REPORTE DE INGRESOS POR PERIODO
 * @param {string} periodo - 'dia', 'mes', 'año'
 * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Datos del reporte de ingresos
 *
 * Frontend: Panel Admin - Gráfico de ingresos
 * - Componente: IngresosChart
 * - Endpoint: GET /api/citas/reporte/ingresos?periodo=mes&fecha_inicio=...&fecha_fin=...
 *
 * Backend relacionado: citaRepository.getIngresosReport
 */
export const getReporteIngresos = async (periodo, fechaInicio, fechaFin) => {
  return citaRepository.getIngresosReport(periodo, fechaInicio, fechaFin);
};
