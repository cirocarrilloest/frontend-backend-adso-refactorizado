// backend/src/repositories/citaRepository/estadisticasQueries.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER ESTADÍSTICAS DEL DASHBOARD
 * @returns {Promise<Object>} Estadísticas completas
 *
 * Frontend: Dashboard Admin
 * Backend relacionado: adminCitaService.getDashboardStats
 */
export const getDashboardStats = async () => {
  const pool = getPool();

  const [citasHoy] = await pool.execute(
    `SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE() AND estado != 'cancelada'`,
  );

  const [citasPendientes] = await pool.execute(
    `SELECT COUNT(*) as total FROM citas WHERE estado = 'pendiente' AND fecha >= CURDATE()`,
  );

  const [ingresosMes] = await pool.execute(
    `SELECT COALESCE(SUM(s.precio), 0) as total
     FROM citas c
     INNER JOIN servicios s ON c.servicio_id = s.id
     WHERE MONTH(c.fecha) = MONTH(CURDATE())
       AND YEAR(c.fecha) = YEAR(CURDATE())
       AND c.estado = 'completada'`,
  );

  const [clientesTotales] = await pool.execute(
    `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'cliente'`,
  );

  const [barberosActivos] = await pool.execute(
    `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'barbero'`,
  );

  const [diasConCitas] = await pool.execute(
    `SELECT COUNT(DISTINCT fecha) as dias_con_citas
     FROM citas
     WHERE MONTH(fecha) = MONTH(CURDATE())
       AND YEAR(fecha) = YEAR(CURDATE())
       AND estado IN ('pendiente', 'confirmada', 'completada')`,
  );

  const [totalCitasMes] = await pool.execute(
    `SELECT COUNT(*) as total
     FROM citas
     WHERE MONTH(fecha) = MONTH(CURDATE())
       AND YEAR(fecha) = YEAR(CURDATE())
       AND estado IN ('pendiente', 'confirmada', 'completada')`,
  );

  const diasConCitasValor = diasConCitas[0]?.dias_con_citas || 1;
  const totalCitasMesValor = totalCitasMes[0]?.total || 0;
  const capacidadMaxima = diasConCitasValor * 16;
  const tasaOcupacion =
    capacidadMaxima > 0
      ? Math.round((totalCitasMesValor / capacidadMaxima) * 100)
      : 0;

  return {
    citas_hoy: citasHoy[0]?.total || 0,
    citas_pendientes: citasPendientes[0]?.total || 0,
    ingresos_mes: ingresosMes[0]?.total || 0,
    clientes_totales: clientesTotales[0]?.total || 0,
    barberos_activos: barberosActivos[0]?.total || 0,
    tasa_ocupacion: Math.min(100, tasaOcupacion),
  };
};

/**
 * OBTENER REPORTE DE INGRESOS POR PERIODO
 * @param {string} periodo - 'dia', 'mes', 'año'
 * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Datos del reporte
 *
 * Frontend: Gráfico de ingresos (Admin)
 * Backend relacionado: adminCitaService.getReporteIngresos
 */
export const getIngresosReport = async (periodo, fechaInicio, fechaFin) => {
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
    [fechaInicio, fechaFin],
  );

  return rows;
};
