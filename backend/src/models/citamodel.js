// backend/src/models/citaModel.js

import { getPool } from "../config/db.js";

const getDiaSemana = (fecha) => {
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaObj = new Date(anio, mes - 1, dia);
  return diasSemana[fechaObj.getDay()];
};

// Crear nueva cita
export const createCita = async (citaData) => {
  const pool = getPool();
  const { cliente_id, barbero_id, servicio_id, fecha, hora, notas } = citaData;

  const query = `
    INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, notas)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    cliente_id,
    barbero_id,
    servicio_id,
    fecha,
    hora,
    notas || null,
  ]);

  return getCitaById(result.insertId);
};

// Verificar si existe duplicación (mismo barbero, fecha y hora)
export const verificarDuplicado = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const query = `
    SELECT id FROM citas 
    WHERE barbero_id = ? AND fecha = ? AND hora = ? 
    AND estado IN ('pendiente', 'confirmada')
  `;
  const [rows] = await pool.execute(query, [barbero_id, fecha, hora]);
  return rows.length > 0;
};

// Obtener cita por ID con detalles
export const getCitaById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT c.*, 
           u.nombre as cliente_nombre, u.email as cliente_email,
           b.nombre as barbero_nombre,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN usuarios b ON c.barbero_id = b.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Obtener citas por cliente
export const getCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const query = `
    SELECT c.*, 
           b.nombre as barbero_nombre,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios b ON c.barbero_id = b.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.cliente_id = ?
    ORDER BY c.fecha DESC, c.hora DESC
  `;
  const [rows] = await pool.execute(query, [cliente_id]);
  return rows;
};

// Obtener citas por barbero
export const getCitasByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  let query = `
    SELECT c.*, 
           u.nombre as cliente_nombre, u.email as cliente_email,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.barbero_id = ?
  `;
  const params = [barbero_id];

  if (fecha) {
    query += ` AND c.fecha = ?`;
    params.push(fecha);
  }

  query += ` ORDER BY c.fecha ASC, c.hora ASC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Obtener todas las citas (admin)
export const getAllCitas = async (filtros = {}) => {
  const pool = getPool();
  let query = `
    SELECT c.*, 
           u.nombre as cliente_nombre, u.email as cliente_email,
           b.nombre as barbero_nombre,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN usuarios b ON c.barbero_id = b.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (filtros.estado) {
    query += ` AND c.estado = ?`;
    params.push(filtros.estado);
  }

  if (filtros.fecha_desde) {
    query += ` AND c.fecha >= ?`;
    params.push(filtros.fecha_desde);
  }

  if (filtros.fecha_hasta) {
    query += ` AND c.fecha <= ?`;
    params.push(filtros.fecha_hasta);
  }

  query += ` ORDER BY c.fecha DESC, c.hora DESC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Actualizar estado de cita
export const updateCitaEstado = async (id, estado) => {
  const pool = getPool();
  const query = `UPDATE citas SET estado = ? WHERE id = ?`;
  const [result] = await pool.execute(query, [estado, id]);

  if (result.affectedRows > 0) {
    return getCitaById(id);
  }
  return null;
};

// Cancelar cita
export const cancelarCita = async (id) => {
  return updateCitaEstado(id, "cancelada");
};

// ACTUALIZAR CITA COMPLETA (para reagendar)
export const updateCita = async (id, datos) => {
  const pool = getPool();
  const { fecha, hora, estado, notas } = datos;

  // 🔧 SOLUCIÓN: Filtrar solo los campos que vienen definidos
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

  // Si no hay nada que actualizar, retornar la cita actual
  if (updates.length === 0) {
    return getCitaById(id);
  }

  const query = `
    UPDATE citas 
    SET ${updates.join(", ")}
    WHERE id = ?
  `;

  values.push(id);

  const [result] = await pool.execute(query, values);

  if (result.affectedRows > 0) {
    return getCitaById(id);
  }
  return null;
};

// Verificar disponibilidad de horario
export const verificarDisponibilidad = async (barbero_id, fecha, hora) => {
  const enHorarioLaboral = await verificarHorarioLaboral(
    barbero_id,
    fecha,
    hora,
  );
  if (!enHorarioLaboral) {
    return false;
  }
  const pool = getPool();
  const query = `
    SELECT COUNT(*) as count FROM citas 
    WHERE barbero_id = ? AND fecha = ? AND hora = ? 
    AND estado IN ('pendiente', 'confirmada')
  `;
  const [rows] = await pool.execute(query, [barbero_id, fecha, hora]);
  return rows[0].count === 0;
};

// Obtener horarios ocupados de un barbero en una fecha específica
export const getHorariosOcupados = async (barbero_id, fecha) => {
  const pool = getPool();
  const query = `
    SELECT hora FROM citas 
    WHERE barbero_id = ? AND fecha = ? 
    AND estado IN ('pendiente', 'confirmada')
    ORDER BY hora
  `;
  const [rows] = await pool.execute(query, [barbero_id, fecha]);
  return rows.map((row) => row.hora);
};

// Actualizar cita por admin
export const updateCitaAdmin = async (id, citaData) => {
  const pool = getPool();
  const { cliente_id, barbero_id, servicio_id, fecha, hora, estado, notas } =
    citaData;

  const query = `
    UPDATE citas 
    SET cliente_id = ?, barbero_id = ?, servicio_id = ?, fecha = ?, hora = ?, estado = ?, notas = ?
    WHERE id = ?
  `;

  const [result] = await pool.execute(query, [
    cliente_id,
    barbero_id,
    servicio_id,
    fecha,
    hora,
    estado,
    notas || null,
    id,
  ]);

  if (result.affectedRows > 0) {
    return getCitaById(id);
  }
  return null;
};

// Obtener próximas citas del cliente
export const getProximasCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const query = `
    SELECT c.*, 
           b.nombre as barbero_nombre,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios b ON c.barbero_id = b.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.cliente_id = ? 
    AND c.estado IN ('pendiente', 'confirmada')
    AND c.fecha >= CURDATE()
    ORDER BY c.fecha ASC, c.hora ASC
  `;
  const [rows] = await pool.execute(query, [cliente_id]);
  return rows;
};

// Obtener historial completo de citas del cliente
export const getHistorialCitasByCliente = async (cliente_id, limite = 10) => {
  try {
    const pool = getPool();
    const clienteIdNum = parseInt(cliente_id);
    let limiteNum = parseInt(limite);

    if (isNaN(clienteIdNum) || clienteIdNum <= 0) {
      throw new Error(`ID de cliente inválido: ${cliente_id}`);
    }

    if (isNaN(limiteNum) || limiteNum <= 0) {
      limiteNum = 10;
    }

    if (limiteNum > 100) {
      limiteNum = 100;
    }

    const query = `
      SELECT c.*, 
             b.nombre as barbero_nombre,
             s.nombre as servicio_nombre, 
             s.duracion, 
             s.precio
      FROM citas c
      JOIN usuarios b ON c.barbero_id = b.id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.cliente_id = ?
      ORDER BY c.fecha DESC, c.hora DESC
      LIMIT ${limiteNum}
    `;

    const [rows] = await pool.execute(query, [clienteIdNum]);
    return rows;
  } catch (error) {
    console.error("Error en getHistorialCitasByCliente:", error);
    throw error;
  }
};

// Obtener agenda del día para un barbero
export const getAgendaDiaByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  const fechaConsulta = fecha || new Date().toISOString().split("T")[0];

  const query = `
    SELECT c.*, 
           u.nombre as cliente_nombre, u.email as cliente_email, u.telefono,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.barbero_id = ? AND c.fecha = ?
    AND c.estado NOT IN ('cancelada')
    ORDER BY c.hora ASC
  `;
  const [rows] = await pool.execute(query, [barbero_id, fechaConsulta]);
  return rows;
};

// Resumen de citas por estado para un barbero
export const getResumenCitasByBarbero = async (
  barbero_id,
  fecha_inicio = null,
  fecha_fin = null,
) => {
  try {
    const pool = getPool();
    let query = `
      SELECT 
          c.estado,
          COUNT(*) as total,
          COALESCE(SUM(s.precio), 0) as ingreso_potencial
      FROM citas c
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.barbero_id = ?
    `;
    const params = [barbero_id];

    if (fecha_inicio && fecha_fin) {
      query += ` AND c.fecha BETWEEN ? AND ?`;
      params.push(fecha_inicio, fecha_fin);
    }

    query += ` GROUP BY c.estado`;

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Error en getResumenCitasByBarbero:", error);
    throw error;
  }
};

// Reporte de ingresos por período
export const getReporteIngresos = async (periodo, fecha_inicio, fecha_fin) => {
  const pool = getPool();

  let groupBy = "";
  if (periodo === "dia") groupBy = "c.fecha";
  if (periodo === "mes") groupBy = "DATE_FORMAT(c.fecha, '%Y-%m')";
  if (periodo === "año") groupBy = "YEAR(c.fecha)";

  const query = `
    SELECT 
        ${groupBy} as periodo,
        COUNT(c.id) as total_citas,
        SUM(s.precio) as ingreso_total,
        AVG(s.precio) as ticket_promedio,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas
    FROM citas c
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.fecha BETWEEN ? AND ?
    AND c.estado IN ('completada', 'confirmada')
    GROUP BY periodo
    ORDER BY periodo DESC
  `;

  const [rows] = await pool.execute(query, [fecha_inicio, fecha_fin]);
  return rows;
};

// Servicios más solicitados
export const getServiciosMasSolicitados = async (
  fecha_inicio = null,
  fecha_fin = null,
  limite = 5,
) => {
  try {
    const pool = getPool();
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 5;
    if (limiteNum > 50) limiteNum = 50;

    let query = `
      SELECT 
          s.id, s.nombre, s.precio, s.duracion,
          COUNT(c.id) as total_citas,
          COALESCE(SUM(s.precio), 0) as ingreso_generado
      FROM servicios s
      JOIN citas c ON s.id = c.servicio_id
      WHERE c.estado NOT IN ('cancelada')
    `;

    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ` AND c.fecha BETWEEN ? AND ?`;
      params.push(fecha_inicio, fecha_fin);
    }

    query += ` GROUP BY s.id ORDER BY total_citas DESC LIMIT ${limiteNum}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Error en getServiciosMasSolicitados:", error);
    throw error;
  }
};

// Clientes más frecuentes
export const getClientesMasFrecuentes = async (
  fecha_inicio = null,
  fecha_fin = null,
  limite = 10,
) => {
  try {
    const pool = getPool();
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 10;
    if (limiteNum > 100) limiteNum = 100;

    let query = `
      SELECT 
          u.id, u.nombre, u.email, u.telefono,
          COUNT(c.id) as total_citas,
          COALESCE(SUM(s.precio), 0) as total_gastado,
          COALESCE(AVG(s.precio), 0) as ticket_promedio
      FROM usuarios u
      JOIN citas c ON u.id = c.cliente_id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.estado = 'completada'
    `;

    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ` AND c.fecha BETWEEN ? AND ?`;
      params.push(fecha_inicio, fecha_fin);
    }

    query += ` GROUP BY u.id ORDER BY total_citas DESC LIMIT ${limiteNum}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Error en getClientesMasFrecuentes:", error);
    throw error;
  }
};

// Distribución de citas por hora del día
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
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
    FROM citas c
    WHERE 1=1
  `;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += ` AND c.fecha BETWEEN ? AND ?`;
    params.push(fecha_inicio, fecha_fin);
  }

  query += ` GROUP BY HOUR(c.hora) ORDER BY hora ASC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Dashboard estadísticas generales
export const getDashboardStats = async () => {
  const pool = getPool();

  const queries = {
    citas_hoy: `SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE() AND estado != 'cancelada'`,
    citas_pendientes: `SELECT COUNT(*) as total FROM citas WHERE estado = 'pendiente' AND fecha >= CURDATE()`,
    ingresos_mes: `SELECT COALESCE(SUM(s.precio), 0) as total FROM citas c JOIN servicios s ON c.servicio_id = s.id WHERE MONTH(c.fecha) = MONTH(CURDATE()) AND YEAR(c.fecha) = YEAR(CURDATE()) AND c.estado = 'completada'`,
    clientes_totales: `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'cliente'`,
    barberos_activos: `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'barbero'`,
    tasa_ocupacion_hoy: `SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE() AND estado IN ('pendiente', 'confirmada')`,
  };

  const entries = Object.entries(queries);
  const allRows = await Promise.all(
    entries.map(([, query]) => pool.execute(query)),
  );
  const results = {};
  entries.forEach(([key], i) => {
    results[key] = allRows[i][0][0].total;
  });

  const barberos = results.barberos_activos || 1;
  const horas_totales = barberos * 8;
  results.tasa_ocupacion = (
    (results.tasa_ocupacion_hoy / horas_totales) *
    100
  ).toFixed(1);

  return results;
};

// Tasa de cancelación por barbero
export const getTasaCancelacionPorBarbero = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const pool = getPool();
  let query = `
    SELECT 
        u.id, u.nombre,
        COUNT(c.id) as total_citas,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        ROUND((SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) / COUNT(c.id)) * 100, 2) as tasa_cancelacion
    FROM usuarios u
    JOIN citas c ON u.id = c.barbero_id
    WHERE u.rol = 'barbero'
  `;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += ` AND c.fecha BETWEEN ? AND ?`;
    params.push(fecha_inicio, fecha_fin);
  }

  query += ` GROUP BY u.id ORDER BY tasa_cancelacion DESC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Obtener horarios disponibles de un barbero en una fecha específica
export const getHorariosDisponibles = async (
  barbero_id,
  fecha,
  duracionSlot = 30,
) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const [horario] = await pool.execute(
    `SELECT hora_inicio, hora_fin FROM horarios_barbero 
     WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
    [barbero_id, diaSemana],
  );

  if (horario.length === 0) return [];

  const slots = [];
  let horaActual = new Date(`2000-01-01T${horario[0].hora_inicio}`);
  const horaFinal = new Date(`2000-01-01T${horario[0].hora_fin}`);

  while (horaActual < horaFinal) {
    slots.push(horaActual.toTimeString().slice(0, 5));
    horaActual.setMinutes(horaActual.getMinutes() + duracionSlot);
  }

  const ocupados = await getHorariosOcupados(barbero_id, fecha);
  const ocupadosSet = new Set(ocupados.map((h) => h.substring(0, 5)));

  return slots.filter((slot) => !ocupadosSet.has(slot));
};

// Obtener citas de la semana por barbero
export const getCitasSemanaByBarbero = async (barbero_id, fecha_inicio) => {
  const pool = getPool();
  const inicio = new Date(fecha_inicio);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  const fecha_fin = fin.toISOString().split("T")[0];

  const query = `
    SELECT c.*,
           u.nombre as cliente_nombre, u.email as cliente_email, u.telefono,
           s.nombre as servicio_nombre, s.duracion, s.precio
    FROM citas c
    JOIN usuarios u ON c.cliente_id = u.id
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.barbero_id = ?
      AND c.fecha BETWEEN ? AND ?
      AND c.estado NOT IN ('cancelada')
    ORDER BY c.fecha ASC, c.hora ASC
  `;

  const [rows] = await pool.execute(query, [
    barbero_id,
    fecha_inicio,
    fecha_fin,
  ]);

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

// Verificar si el barbero trabaja en ese día y hora
export const verificarHorarioLaboral = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const diaSemana = getDiaSemana(fecha);

  const query = `
    SELECT hora_inicio, hora_fin 
    FROM horarios_barbero 
    WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE
  `;
  const [rows] = await pool.execute(query, [barbero_id, diaSemana]);

  if (rows.length === 0) return false;

  const { hora_inicio, hora_fin } = rows[0];
  const horaStr = hora.substring(0, 5);
  const inicioStr = hora_inicio.substring(0, 5);
  const finStr = hora_fin.substring(0, 5);

  return horaStr >= inicioStr && horaStr < finStr;
};

// Exportar TODO con un SOLO export default
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
