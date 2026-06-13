// src/controllers/citaController/reportesModule.js
import adminCitaService from "../../services/adminCitaService.js";
import { getPool } from "../../config/db.js";
import { ok } from "../../utils/responseUtils.js";

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminCitaService.getDashboardStats();
    const serviciosTop = await getServiciosTopInternal(req);
    const clientesTop = await getClientesTopInternal(req);
    const citasCercanas = await adminCitaService.getCitasCercanas(5);

    return ok(res, {
      dashboard: {
        ...stats,
        servicios_top: serviciosTop || [],
        clientes_top: clientesTop || [],
        citas_cercanas: citasCercanas || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDistribucionHoraria = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin, barbero_id } = req.query;

    if (
      !fecha_inicio ||
      fecha_inicio === "null" ||
      fecha_inicio === "undefined" ||
      fecha_inicio === ""
    ) {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      fecha_inicio = haceUnMes.toISOString().split("T")[0];
    }
    if (
      !fecha_fin ||
      fecha_fin === "null" ||
      fecha_fin === "undefined" ||
      fecha_fin === ""
    ) {
      const hoy = new Date();
      fecha_fin = hoy.toISOString().split("T")[0];
    }

    const pool = await getPool(); // ✅ CORREGIDO: añadido await

    if (barbero_id) {
      const [horarioBarbero] = await pool.execute(
        `SELECT hora_inicio, hora_fin FROM horarios_barbero 
         WHERE barbero_id = ? AND activo = TRUE 
         ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
         LIMIT 1`,
        [barbero_id],
      );

      const horaInicio = horarioBarbero[0]?.hora_inicio || "09:00";
      const horaFin = horarioBarbero[0]?.hora_fin || "20:00";
      const horaInicioNum = parseInt(horaInicio.split(":")[0]);
      const horaFinNum = parseInt(horaFin.split(":")[0]);

      const horas = [];
      for (let h = horaInicioNum; h < horaFinNum; h++) {
        horas.push(h);
      }

      if (horas.length === 0) {
        return ok(res, {
          distribucion: [],
          mensaje: "No hay horas laborales configuradas para este barbero",
        });
      }

      const [rows] = await pool.execute(
        `SELECT HOUR(c.hora) as hora, 
                COUNT(*) as total_citas,
                SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
         FROM citas c
         WHERE c.barbero_id = ?
           AND c.fecha BETWEEN ? AND ?
           AND c.estado IN ('completada', 'confirmada')
           AND HOUR(c.hora) BETWEEN ? AND ?
         GROUP BY HOUR(c.hora)
         ORDER BY hora ASC`,
        [barbero_id, fecha_inicio, fecha_fin, horaInicioNum, horaFinNum - 1],
      );

      const resultadosMap = new Map();
      for (const row of rows) {
        resultadosMap.set(row.hora, row);
      }

      const distribucionCompleta = horas.map((hora) => ({
        hora: hora,
        total_citas: resultadosMap.get(hora)?.total_citas || 0,
        completadas: resultadosMap.get(hora)?.completadas || 0,
        canceladas: resultadosMap.get(hora)?.canceladas || 0,
        horario_barbero: `${horaInicio} - ${horaFin}`,
      }));

      return ok(res, {
        distribucion: distribucionCompleta,
        barbero_id: parseInt(barbero_id),
        rango_horario: `${horaInicio} - ${horaFin}`,
        periodo: { fecha_inicio, fecha_fin },
      });
    }

    const [barberos] = await pool.execute(
      `SELECT id, nombre FROM usuarios WHERE rol = 'barbero'`,
    );

    if (barberos.length === 0) {
      return ok(res, { distribucion: [], mensaje: "No hay barberos" });
    }

    const rangosHorarios = [];
    for (const barbero of barberos) {
      const [horario] = await pool.execute(
        `SELECT MIN(HOUR(hora_inicio)) as min_hora, MAX(HOUR(hora_fin)) as max_hora 
         FROM horarios_barbero 
         WHERE barbero_id = ? AND activo = TRUE`,
        [barbero.id],
      );
      if (horario[0]?.min_hora) {
        rangosHorarios.push({
          barbero_id: barbero.id,
          min_hora: horario[0].min_hora,
          max_hora: horario[0].max_hora,
        });
      }
    }

    const horaGlobalMin = Math.min(...rangosHorarios.map((r) => r.min_hora), 8);
    const horaGlobalMax = Math.max(
      ...rangosHorarios.map((r) => r.max_hora),
      20,
    );

    const [rows] = await pool.execute(
      `SELECT HOUR(c.hora) as hora, 
              COUNT(*) as total_citas,
              SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
              SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
       FROM citas c
       WHERE c.fecha BETWEEN ? AND ?
         AND c.estado IN ('completada', 'confirmada')
         AND HOUR(c.hora) BETWEEN ? AND ?
       GROUP BY HOUR(c.hora)
       ORDER BY hora ASC`,
      [fecha_inicio, fecha_fin, horaGlobalMin, horaGlobalMax - 1],
    );

    const resultadosMap = new Map();
    for (const row of rows) {
      resultadosMap.set(row.hora, row);
    }

    const distribucionCompleta = [];
    for (let hora = horaGlobalMin; hora < horaGlobalMax; hora++) {
      distribucionCompleta.push({
        hora: hora,
        total_citas: resultadosMap.get(hora)?.total_citas || 0,
        completadas: resultadosMap.get(hora)?.completadas || 0,
        canceladas: resultadosMap.get(hora)?.canceladas || 0,
      });
    }

    return ok(res, {
      distribucion: distribucionCompleta,
      rango_horario_global: `${String(horaGlobalMin).padStart(2, "0")}:00 - ${String(horaGlobalMax).padStart(2, "0")}:00`,
      total_barberos: barberos.length,
      periodo: { fecha_inicio, fecha_fin },
    });
  } catch (error) {
    console.error("Error en getDistribucionHoraria:", error);
    next(error);
  }
};

export const getReporteIngresos = async (req, res, next) => {
  try {
    let { periodo = "mes", fecha_inicio, fecha_fin } = req.query;

    if (
      !fecha_inicio ||
      fecha_inicio === "null" ||
      fecha_inicio === "undefined" ||
      fecha_inicio === ""
    ) {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      fecha_inicio = haceUnMes.toISOString().split("T")[0];
    }
    if (
      !fecha_fin ||
      fecha_fin === "null" ||
      fecha_fin === "undefined" ||
      fecha_fin === ""
    ) {
      const hoy = new Date();
      fecha_fin = hoy.toISOString().split("T")[0];
    }

    const reporte = await adminCitaService.getReporteIngresos(
      periodo,
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { periodo, fecha_inicio, fecha_fin, reporte });
  } catch (error) {
    next(error);
  }
};

export const getServiciosTop = async (req, res, next) => {
  try {
    const resultados = await getServiciosTopInternal(req);
    return ok(res, { servicios: resultados });
  } catch (error) {
    console.error("Error en getServiciosTop:", error);
    return ok(res, { servicios: [] });
  }
};

export const getClientesTop = async (req, res, next) => {
  try {
    const resultados = await getClientesTopInternal(req);
    return ok(res, { clientes: resultados });
  } catch (error) {
    console.error("Error en getClientesTop:", error);
    return ok(res, { clientes: [] });
  }
};

export const getTasaCancelacion = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;
    const pool = await getPool(); // ✅ CORREGIDO: añadido await
    let query, params;

    const tieneFechas =
      fecha_inicio &&
      fecha_fin &&
      fecha_inicio !== "null" &&
      fecha_inicio !== "undefined" &&
      fecha_fin !== "null" &&
      fecha_fin !== "undefined" &&
      fecha_inicio !== "" &&
      fecha_fin !== "";

    if (tieneFechas) {
      query = `
        SELECT 
          u.id, u.nombre,
          COUNT(c.id) as total_citas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 2) as tasa_cancelacion
        FROM usuarios u
        LEFT JOIN citas c ON u.id = c.barbero_id AND c.fecha BETWEEN ? AND ?
        WHERE u.rol = 'barbero'
        GROUP BY u.id, u.nombre
        HAVING total_citas > 0
        ORDER BY tasa_cancelacion DESC
      `;
      params = [fecha_inicio, fecha_fin];
    } else {
      query = `
        SELECT 
          u.id, u.nombre,
          COUNT(c.id) as total_citas,
          SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          ROUND(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 2) as tasa_cancelacion
        FROM usuarios u
        LEFT JOIN citas c ON u.id = c.barbero_id
        WHERE u.rol = 'barbero'
        GROUP BY u.id, u.nombre
        HAVING total_citas > 0
        ORDER BY tasa_cancelacion DESC
      `;
      params = [];
    }

    const [rows] = await pool.execute(query, params);
    return ok(res, { reporte: rows });
  } catch (error) {
    console.error("Error en getTasaCancelacion:", error);
    return ok(res, { reporte: [] });
  }
};

export const getTasaCancelacionPorBarbero = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;

    if (
      !fecha_inicio ||
      fecha_inicio === "null" ||
      fecha_inicio === "undefined" ||
      fecha_inicio === ""
    ) {
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      fecha_inicio = haceUnMes.toISOString().split("T")[0];
    }
    if (
      !fecha_fin ||
      fecha_fin === "null" ||
      fecha_fin === "undefined" ||
      fecha_fin === ""
    ) {
      const hoy = new Date();
      fecha_fin = hoy.toISOString().split("T")[0];
    }

    const pool = await getPool(); // ✅ CORREGIDO: añadido await
    const [rows] = await pool.execute(
      `SELECT 
        u.id, u.nombre,
        COUNT(c.id) as total_citas,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        ROUND(IFNULL(SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 0), 2) as tasa_cancelacion
       FROM usuarios u
       LEFT JOIN citas c ON u.id = c.barbero_id AND c.fecha BETWEEN ? AND ?
       WHERE u.rol = 'barbero'
       GROUP BY u.id, u.nombre
       HAVING total_citas > 0
       ORDER BY tasa_cancelacion DESC`,
      [fecha_inicio, fecha_fin],
    );

    return ok(res, { barberos: rows });
  } catch (error) {
    console.error("Error en getTasaCancelacionPorBarbero:", error);
    return ok(res, { barberos: [] });
  }
};

// Funciones internas helpers
async function getServiciosTopInternal(req) {
  try {
    let { fecha_inicio, fecha_fin, limite = 5 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum < 1) limiteNum = 5;
    if (limiteNum > 100) limiteNum = 100;

    const pool = await getPool(); // ✅ CORREGIDO: añadido await
    let query, params;

    const tieneFechas =
      fecha_inicio &&
      fecha_fin &&
      fecha_inicio !== "null" &&
      fecha_inicio !== "undefined" &&
      fecha_fin !== "null" &&
      fecha_fin !== "undefined" &&
      fecha_inicio !== "" &&
      fecha_fin !== "";

    if (tieneFechas) {
      query = `
        SELECT s.id, s.nombre, s.precio, COUNT(c.id) as total_citas,
               ROUND(SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(c.id), 0), 1) as tasa_exito
        FROM servicios s
        LEFT JOIN citas c ON s.id = c.servicio_id AND c.fecha BETWEEN ? AND ?
        GROUP BY s.id, s.nombre, s.precio
        ORDER BY total_citas DESC
        LIMIT ${limiteNum}
      `;
      params = [fecha_inicio, fecha_fin];
    } else {
      query = `
        SELECT s.id, s.nombre, s.precio, COUNT(c.id) as total_citas,
               ROUND(SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(c.id), 0), 1) as tasa_exito
        FROM servicios s
        LEFT JOIN citas c ON s.id = c.servicio_id
        GROUP BY s.id, s.nombre, s.precio
        ORDER BY total_citas DESC
        LIMIT ${limiteNum}
      `;
      params = [];
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Error en getServiciosTopInternal:", error);
    return [];
  }
}

async function getClientesTopInternal(req) {
  try {
    let { fecha_inicio, fecha_fin, limite = 5 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum < 1) limiteNum = 5;
    if (limiteNum > 100) limiteNum = 100;

    const pool = await getPool(); // ✅ CORREGIDO: añadido await
    let query, params;

    const tieneFechas =
      fecha_inicio &&
      fecha_fin &&
      fecha_inicio !== "null" &&
      fecha_inicio !== "undefined" &&
      fecha_fin !== "null" &&
      fecha_fin !== "undefined" &&
      fecha_inicio !== "" &&
      fecha_fin !== "";

    if (tieneFechas) {
      query = `
        SELECT u.id, u.nombre, u.email, 
               COUNT(c.id) as total_citas, 
               COALESCE(SUM(s.precio), 0) as total_gastado
        FROM usuarios u
        INNER JOIN citas c ON u.id = c.cliente_id AND c.fecha BETWEEN ? AND ?
        INNER JOIN servicios s ON c.servicio_id = s.id
        WHERE u.rol = 'cliente' AND c.estado = 'completada'
        GROUP BY u.id, u.nombre, u.email
        ORDER BY total_citas DESC
        LIMIT ${limiteNum}
      `;
      params = [fecha_inicio, fecha_fin];
    } else {
      query = `
        SELECT u.id, u.nombre, u.email, 
               COUNT(c.id) as total_citas, 
               COALESCE(SUM(s.precio), 0) as total_gastado
        FROM usuarios u
        INNER JOIN citas c ON u.id = c.cliente_id
        INNER JOIN servicios s ON c.servicio_id = s.id
        WHERE u.rol = 'cliente' AND c.estado = 'completada'
        GROUP BY u.id, u.nombre, u.email
        ORDER BY total_citas DESC
        LIMIT ${limiteNum}
      `;
      params = [];
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Error en getClientesTopInternal:", error);
    return [];
  }
}
