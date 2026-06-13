// backend/src/models/citaModel/queriesAdmin.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER TODAS LAS CITAS CON FILTROS
 * @param {Object} filtros - Filtros (estado, fecha_desde, fecha_hasta)
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Panel Admin - Tabla de todas las citas
 * Backend relacionado: adminCitaService.getAllCitas
 */
export const getAllCitas = async (filtros = {}) => {
  const pool = getPool();
  let query = `SELECT c.*, 
                      u.nombre as cliente_nombre, u.email as cliente_email, 
                      b.nombre as barbero_nombre, 
                      s.nombre as servicio_nombre, s.duracion, s.precio
               FROM citas c 
               JOIN usuarios u ON c.cliente_id = u.id 
               JOIN usuarios b ON c.barbero_id = b.id 
               JOIN servicios s ON c.servicio_id = s.id 
               WHERE 1=1`;
  const params = [];

  if (filtros.estado) {
    query += " AND c.estado = ?";
    params.push(filtros.estado);
  }
  if (filtros.fecha_desde) {
    query += " AND c.fecha >= ?";
    params.push(filtros.fecha_desde);
  }
  if (filtros.fecha_hasta) {
    query += " AND c.fecha <= ?";
    params.push(filtros.fecha_hasta);
  }
  query += " ORDER BY c.fecha DESC, c.hora DESC";

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * OBTENER ESTADÍSTICAS DEL DASHBOARD ADMIN
 * @returns {Promise<Object>} Estadísticas completas
 *
 * Frontend: Dashboard Admin - Tarjetas y gráficos
 * Backend relacionado: adminCitaService.getDashboardStats
 */
export const getDashboardStats = async () => {
  const pool = getPool();

  // Citas de hoy (no canceladas)
  const [citasHoy] = await pool.execute(
    `SELECT COUNT(*) as total FROM citas 
     WHERE fecha = CURDATE() AND estado != 'cancelada'`,
  );

  // Citas pendientes (futuras)
  const [citasPendientes] = await pool.execute(
    `SELECT COUNT(*) as total FROM citas 
     WHERE estado = 'pendiente' AND fecha >= CURDATE()`,
  );

  // Ingresos del mes (solo completadas)
  const [ingresosMes] = await pool.execute(
    `SELECT COALESCE(SUM(s.precio), 0) as total 
     FROM citas c 
     INNER JOIN servicios s ON c.servicio_id = s.id 
     WHERE MONTH(c.fecha) = MONTH(CURDATE()) 
       AND YEAR(c.fecha) = YEAR(CURDATE()) 
       AND c.estado = 'completada'`,
  );

  // Clientes totales
  const [clientesTotales] = await pool.execute(
    `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'cliente'`,
  );

  // Barberos activos
  const [barberosActivos] = await pool.execute(
    `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'barbero'`,
  );

  // Citas de hoy por barbero
  const [citasHoyPorBarbero] = await pool.execute(
    `SELECT c.barbero_id, COUNT(c.id) as total
     FROM citas c
     WHERE c.fecha = CURDATE() AND c.estado IN ('pendiente', 'confirmada')
     GROUP BY c.barbero_id`,
  );

  // Tasa de ocupación
  const barberosCount = barberosActivos[0].total || 1;
  const totalCitasHoy = citasHoyPorBarbero.reduce((sum, b) => sum + b.total, 0);
  const capacidadMaxima = barberosCount * 8;
  const tasaOcupacion =
    capacidadMaxima > 0
      ? ((totalCitasHoy / capacidadMaxima) * 100).toFixed(1)
      : 0;

  return {
    citas_hoy: citasHoy[0].total,
    citas_pendientes: citasPendientes[0].total,
    ingresos_mes: ingresosMes[0].total,
    clientes_totales: clientesTotales[0].total,
    barberos_activos: barberosActivos[0].total,
    tasa_ocupacion: tasaOcupacion,
    citas_hoy_detalle: citasHoyPorBarbero,
  };
};
