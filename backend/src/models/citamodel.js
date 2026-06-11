// src/models/citaModel.js
/**
 * Data Access Layer para citas.
 * Contiene todas las queries SQL relacionadas con la tabla citas.
 *
 * getDiaSemana() fue movida a utils/dateUtils.js y se importa aquí.
 */

import { getPool } from "../config/db.js";
import { getDiaSemana } from "../utils/dateUtils.js";

export const createCita = async (citaData) => {
  const pool = getPool();
  const { cliente_id, barbero_id, servicio_id, fecha, hora, notas } = citaData;
  const [result] = await pool.execute(
    "INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, notas) VALUES (?, ?, ?, ?, ?, ?)",
    [cliente_id, barbero_id, servicio_id, fecha, hora, notas || null],
  );
  return getCitaById(result.insertId);
};

export const verificarDuplicado = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT id FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')",
    [barbero_id, fecha, hora],
  );
  return rows.length > 0;
};

export const getCitaById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.*,
            u.nombre as cliente_nombre, u.email as cliente_email,
            b.nombre as barbero_nombre,
            s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c
     JOIN usuarios u ON c.cliente_id = u.id
     JOIN usuarios b ON c.barbero_id = b.id
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.id = ?`,
    [id],
  );
  return rows[0] || null;
};

export const getCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c
     JOIN usuarios b ON c.barbero_id = b.id
     JOIN servicios s ON c.servicio_id = s.id
     WHERE c.cliente_id = ?
     ORDER BY c.fecha DESC, c.hora DESC`,
    [cliente_id],
  );
  return rows;
};

export const getCitasByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  let query = `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, s.nombre as servicio_nombre, s.duracion, s.precio
               FROM citas c JOIN usuarios u ON c.cliente_id = u.id JOIN servicios s ON c.servicio_id = s.id
               WHERE c.barbero_id = ?`;
  const params = [barbero_id];
  if (fecha) {
    query += " AND c.fecha = ?";
    params.push(fecha);
  }
  query += " ORDER BY c.fecha ASC, c.hora ASC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getAllCitas = async (filtros = {}) => {
  const pool = getPool();
  let query = `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
               FROM citas c JOIN usuarios u ON c.cliente_id = u.id JOIN usuarios b ON c.barbero_id = b.id JOIN servicios s ON c.servicio_id = s.id WHERE 1=1`;
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

export const updateCitaEstado = async (id, estado) => {
  const pool = getPool();
  const [result] = await pool.execute(
    "UPDATE citas SET estado = ? WHERE id = ?",
    [estado, id],
  );
  return result.affectedRows > 0 ? getCitaById(id) : null;
};

export const cancelarCita = async (id) => updateCitaEstado(id, "cancelada");

export const updateCita = async (id, datos) => {
  const pool = getPool();
  const { fecha, hora, estado, notas } = datos;
  const updates = [];
  const values = [];
  if (fecha !== undefined) {
    updates.push("fecha = ?");
    values.push(fecha);
  }
  if (hora !== undefined) {
    updates.push("hora = ?");
    values.push(hora);
  }
  if (estado !== undefined) {
    updates.push("estado = ?");
    values.push(estado);
  }
  if (notas !== undefined) {
    updates.push("notas = ?");
    values.push(notas);
  }
  if (updates.length === 0) return getCitaById(id);
  values.push(id);
  const [result] = await pool.execute(
    `UPDATE citas SET ${updates.join(", ")} WHERE id = ?`,
    values,
  );
  return result.affectedRows > 0 ? getCitaById(id) : null;
};

export const verificarDisponibilidad = async (barbero_id, fecha, hora) => {
  const enHorario = await verificarHorarioLaboral(barbero_id, fecha, hora);
  if (!enHorario) return false;
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT COUNT(*) as count FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')",
    [barbero_id, fecha, hora],
  );
  return rows[0].count === 0;
};

export const getHorariosOcupados = async (barbero_id, fecha) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT hora FROM citas WHERE barbero_id = ? AND fecha = ? AND estado IN ('pendiente', 'confirmada') ORDER BY hora",
    [barbero_id, fecha],
  );
  return rows.map((r) => r.hora);
};

export const getProximasCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c JOIN usuarios b ON c.barbero_id = b.id JOIN servicios s ON c.servicio_id = s.id
     WHERE c.cliente_id = ? AND c.estado IN ('pendiente', 'confirmada') AND c.fecha >= CURDATE()
     ORDER BY c.fecha ASC, c.hora ASC`,
    [cliente_id],
  );
  return rows;
};

export const getHistorialCitasByCliente = async (cliente_id, limite = 10) => {
  const pool = getPool();
  const clienteIdNum = parseInt(cliente_id);
  let limiteNum = parseInt(limite);
  if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 10;
  if (limiteNum > 100) limiteNum = 100;
  const [rows] = await pool.execute(
    `SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c JOIN usuarios b ON c.barbero_id = b.id JOIN servicios s ON c.servicio_id = s.id
     WHERE c.cliente_id = ? ORDER BY c.fecha DESC, c.hora DESC LIMIT ${limiteNum}`,
    [clienteIdNum],
  );
  return rows;
};

export const getAgendaDiaByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  const fechaConsulta = fecha || new Date().toISOString().split("T")[0];
  const [rows] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c JOIN usuarios u ON c.cliente_id = u.id JOIN servicios s ON c.servicio_id = s.id
     WHERE c.barbero_id = ? AND c.fecha = ? AND c.estado NOT IN ('cancelada') ORDER BY c.hora ASC`,
    [barbero_id, fechaConsulta],
  );
  return rows;
};

export const getResumenCitasByBarbero = async (
  barbero_id,
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `SELECT c.estado, COUNT(*) as total, COALESCE(SUM(s.precio), 0) as ingreso_potencial
               FROM citas c JOIN servicios s ON c.servicio_id = s.id WHERE c.barbero_id = ?`;
  const params = [barbero_id];
  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }
  query += " GROUP BY c.estado";
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getReporteIngresos = async (periodo, fecha_inicio, fecha_fin) => {
  const pool = getPool();
  const groupBy =
    periodo === "dia"
      ? "c.fecha"
      : periodo === "mes"
        ? "DATE_FORMAT(c.fecha, '%Y-%m')"
        : "YEAR(c.fecha)";
  const [rows] = await pool.execute(
    `SELECT ${groupBy} as periodo, COUNT(c.id) as total_citas, SUM(s.precio) as ingreso_total,
            AVG(s.precio) as ticket_promedio,
            SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
            SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas
     FROM citas c JOIN servicios s ON c.servicio_id = s.id
     WHERE c.fecha BETWEEN ? AND ? AND c.estado IN ('completada', 'confirmada')
     GROUP BY periodo ORDER BY periodo DESC`,
    [fecha_inicio, fecha_fin],
  );
  return rows;
};

export const getServiciosMasSolicitados = async (
  fecha_inicio = null,
  fecha_fin = null,
  limite = 5,
) => {
  const pool = getPool();
  const limiteNum = Math.min(Math.max(parseInt(limite) || 5, 1), 50);
  let query = `SELECT s.id, s.nombre, s.precio, s.duracion, COUNT(c.id) as total_citas, COALESCE(SUM(s.precio), 0) as ingreso_generado
               FROM servicios s JOIN citas c ON s.id = c.servicio_id WHERE c.estado NOT IN ('cancelada')`;
  const params = [];
  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }
  query += ` GROUP BY s.id ORDER BY total_citas DESC LIMIT ${limiteNum}`;
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getClientesMasFrecuentes = async (
  fecha_inicio = null,
  fecha_fin = null,
  limite = 10,
) => {
  const pool = getPool();
  const limiteNum = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
  let query = `SELECT u.id, u.nombre, u.email, u.telefono, COUNT(c.id) as total_citas,
                      COALESCE(SUM(s.precio), 0) as total_gastado, COALESCE(AVG(s.precio), 0) as ticket_promedio
               FROM usuarios u JOIN citas c ON u.id = c.cliente_id JOIN servicios s ON c.servicio_id = s.id
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

export const getDistribucionCitasPorHora = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `SELECT HOUR(c.hora) as hora, COUNT(*) as total_citas,
                      SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
               FROM citas c WHERE 1=1`;
  const params = [];
  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }
  query += " GROUP BY HOUR(c.hora) ORDER BY hora ASC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getDashboardStats = async () => {
  const pool = getPool();
  const queries = {
    citas_hoy:
      "SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE() AND estado != 'cancelada'",
    citas_pendientes:
      "SELECT COUNT(*) as total FROM citas WHERE estado = 'pendiente' AND fecha >= CURDATE()",
    ingresos_mes:
      "SELECT COALESCE(SUM(s.precio), 0) as total FROM citas c JOIN servicios s ON c.servicio_id = s.id WHERE MONTH(c.fecha) = MONTH(CURDATE()) AND YEAR(c.fecha) = YEAR(CURDATE()) AND c.estado = 'completada'",
    clientes_totales:
      "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'cliente'",
    barberos_activos:
      "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'barbero'",
    tasa_ocupacion_hoy:
      "SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE() AND estado IN ('pendiente', 'confirmada')",
  };
  const entries = Object.entries(queries);
  const allRows = await Promise.all(entries.map(([, q]) => pool.execute(q)));
  const results = {};
  entries.forEach(([key], i) => {
    results[key] = allRows[i][0][0].total;
  });
  const barberos = results.barberos_activos || 1;
  results.tasa_ocupacion = (
    (results.tasa_ocupacion_hoy / (barberos * 8)) *
    100
  ).toFixed(1);
  return results;
};

export const getTasaCancelacionPorBarbero = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `SELECT u.id, u.nombre, COUNT(c.id) as total_citas,
                      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
                      ROUND((SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) / COUNT(c.id)) * 100, 2) as tasa_cancelacion
               FROM usuarios u JOIN citas c ON u.id = c.barbero_id WHERE u.rol = 'barbero'`;
  const params = [];
  if (fecha_inicio && fecha_fin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }
  query += " GROUP BY u.id ORDER BY tasa_cancelacion DESC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getHorariosDisponibles = async (
  barbero_id,
  fecha,
  duracionSlot = 30,
) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);
  const [horario] = await pool.execute(
    "SELECT hora_inicio, hora_fin FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE",
    [barbero_id, diaSemana],
  );
  if (horario.length === 0) return [];
  const slots = [];
  let actual = new Date(`2000-01-01T${horario[0].hora_inicio}`);
  const fin = new Date(`2000-01-01T${horario[0].hora_fin}`);
  while (actual < fin) {
    slots.push(actual.toTimeString().slice(0, 5));
    actual.setMinutes(actual.getMinutes() + duracionSlot);
  }
  const ocupados = await getHorariosOcupados(barbero_id, fecha);
  const ocupadosSet = new Set(ocupados.map((h) => h.substring(0, 5)));
  return slots.filter((s) => !ocupadosSet.has(s));
};

export const getCitasSemanaByBarbero = async (barbero_id, fecha_inicio) => {
  const pool = getPool();
  const inicio = new Date(fecha_inicio);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  const fecha_fin = fin.toISOString().split("T")[0];
  const [rows] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c JOIN usuarios u ON c.cliente_id = u.id JOIN servicios s ON c.servicio_id = s.id
     WHERE c.barbero_id = ? AND c.fecha BETWEEN ? AND ? AND c.estado NOT IN ('cancelada')
     ORDER BY c.fecha ASC, c.hora ASC`,
    [barbero_id, fecha_inicio, fecha_fin],
  );
  const agenda = {};
  rows.forEach((cita) => {
    const fecha = cita.fecha.toISOString
      ? cita.fecha.toISOString().split("T")[0]
      : cita.fecha;
    if (!agenda[fecha]) agenda[fecha] = [];
    agenda[fecha].push(cita);
  });
  return { agenda, fecha_inicio, fecha_fin };
};

export const verificarHorarioLaboral = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);
  const [rows] = await pool.execute(
    "SELECT hora_inicio, hora_fin FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE",
    [barbero_id, diaSemana],
  );
  if (rows.length === 0) return false;
  const horaStr = hora.substring(0, 5);
  return (
    horaStr >= String(rows[0].hora_inicio).substring(0, 5) &&
    horaStr < String(rows[0].hora_fin).substring(0, 5)
  );
};

export const updateCitaAdmin = async (id, citaData) => {
  const pool = getPool();
  const { cliente_id, barbero_id, servicio_id, fecha, hora, estado, notas } =
    citaData;
  const [result] = await pool.execute(
    "UPDATE citas SET cliente_id = ?, barbero_id = ?, servicio_id = ?, fecha = ?, hora = ?, estado = ?, notas = ? WHERE id = ?",
    [
      cliente_id,
      barbero_id,
      servicio_id,
      fecha,
      hora,
      estado,
      notas || null,
      id,
    ],
  );
  return result.affectedRows > 0 ? getCitaById(id) : null;
};

export default {
  createCita,
  verificarDuplicado,
  getCitaById,
  getCitasByCliente,
  getCitasByBarbero,
  getAllCitas,
  updateCitaEstado,
  cancelarCita,
  updateCita,
  updateCitaAdmin,
  verificarDisponibilidad,
  verificarHorarioLaboral,
  getHorariosOcupados,
  getHorariosDisponibles,
  getProximasCitasByCliente,
  getHistorialCitasByCliente,
  getAgendaDiaByBarbero,
  getResumenCitasByBarbero,
  getReporteIngresos,
  getServiciosMasSolicitados,
  getClientesMasFrecuentes,
  getDistribucionCitasPorHora,
  getDashboardStats,
  getTasaCancelacionPorBarbero,
  getCitasSemanaByBarbero,
};
