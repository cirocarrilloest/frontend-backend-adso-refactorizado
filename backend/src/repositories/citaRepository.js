// src/repositories/citaRepository.js
import { getPool } from "../config/db.js";
import { getDiaSemana } from "../utils/dateUtils.js";

/**
 * Repositorio de citas - Capa de acceso a datos
 */

export const citaRepository = {
  async create(citaData) {
    const pool = getPool();
    const {
      cliente_id,
      barbero_id,
      servicio_id,
      fecha,
      hora,
      notas,
      estado = "pendiente",
    } = citaData;

    const [result] = await pool.execute(
      `INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, notas, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cliente_id, barbero_id, servicio_id, fecha, hora, notas || null, estado],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
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
  },

  async findByClienteId(clienteId, options = {}) {
    const pool = getPool();
    let query = `
      SELECT c.*, b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
      FROM citas c
      JOIN usuarios b ON c.barbero_id = b.id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.cliente_id = ?
    `;
    const params = [clienteId];

    if (options.estado) {
      query += " AND c.estado = ?";
      params.push(options.estado);
    }

    if (options.soloFuturas) {
      query += " AND c.fecha >= CURDATE()";
    }

    query += ` ORDER BY c.fecha ${options.orden || "DESC"}, c.hora ${options.orden || "DESC"}`;

    if (options.limite) {
      query += ` LIMIT ${parseInt(options.limite)}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findByBarberoAndDate(barberoId, fecha, estado = null) {
    const pool = getPool();
    let query = `
      SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email,
             s.nombre as servicio_nombre, s.duracion, s.precio
      FROM citas c
      JOIN usuarios u ON c.cliente_id = u.id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.barbero_id = ? AND c.fecha = ?
    `;
    const params = [barberoId, fecha];

    if (estado) {
      query += " AND c.estado = ?";
      params.push(estado);
    }

    query += " ORDER BY c.hora ASC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findByBarberoAndDateRange(barberoId, fechaInicio, fechaFin) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email,
              s.nombre as servicio_nombre, s.duracion, s.precio
       FROM citas c
       JOIN usuarios u ON c.cliente_id = u.id
       JOIN servicios s ON c.servicio_id = s.id
       WHERE c.barbero_id = ? AND c.fecha BETWEEN ? AND ?
       ORDER BY c.fecha ASC, c.hora ASC`,
      [barberoId, fechaInicio, fechaFin],
    );
    return rows;
  },

  async existsDuplicate(barberoId, fecha, hora, excludeId = null) {
    const pool = getPool();
    let query = `
      SELECT id FROM citas
      WHERE barbero_id = ? AND fecha = ? AND hora = ?
      AND estado IN ('pendiente', 'confirmada')
    `;
    const params = [barberoId, fecha, hora];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  },

  async getHorariosOcupados(barberoId, fecha) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT hora FROM citas
       WHERE barbero_id = ? AND fecha = ?
       AND estado IN ('pendiente', 'confirmada')
       ORDER BY hora`,
      [barberoId, fecha],
    );
    return rows.map((r) => r.hora);
  },

  async isWithinWorkingHours(barberoId, fecha, hora) {
    const pool = getPool();
    const diaSemana = getDiaSemana(fecha);

    const [rows] = await pool.execute(
      `SELECT hora_inicio, hora_fin
       FROM horarios_barbero
       WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
      [barberoId, diaSemana],
    );

    if (rows.length === 0) return false;

    const horaStr = String(hora).slice(0, 5);
    const inicio = String(rows[0].hora_inicio).slice(0, 5);
    const fin = String(rows[0].hora_fin).slice(0, 5);

    return horaStr >= inicio && horaStr < fin;
  },

  async update(id, updates) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const allowedFields = [
      "fecha",
      "hora",
      "estado",
      "notas",
      "cliente_id",
      "barbero_id",
      "servicio_id",
    ];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.execute(
      `UPDATE citas SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return this.findById(id);
  },

  async updateEstado(id, estado) {
    return this.update(id, { estado });
  },

  async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute("DELETE FROM citas WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  async findAll(filters = {}, pagination = {}) {
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

    if (filters.estado) {
      query += " AND c.estado = ?";
      params.push(filters.estado);
    }
    if (filters.fecha_desde) {
      query += " AND c.fecha >= ?";
      params.push(filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      query += " AND c.fecha <= ?";
      params.push(filters.fecha_hasta);
    }
    if (filters.barbero_id) {
      query += " AND c.barbero_id = ?";
      params.push(filters.barbero_id);
    }
    if (filters.cliente_id) {
      query += " AND c.cliente_id = ?";
      params.push(filters.cliente_id);
    }

    query += " ORDER BY c.fecha DESC, c.hora DESC";

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 15));
    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async getDashboardStats() {
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
  },

  // CORREGIDO: LIMIT con interpolación directa
  async getCitasCercanas(limite = 5) {
    const pool = getPool();
    const limiteNum = parseInt(limite);
    const [rows] = await pool.execute(
      `SELECT 
        c.id, c.fecha, c.hora, c.estado,
        u.nombre as cliente_nombre,
        b.nombre as barbero_nombre,
        s.nombre as servicio_nombre
       FROM citas c
       JOIN usuarios u ON c.cliente_id = u.id
       JOIN usuarios b ON c.barbero_id = b.id
       JOIN servicios s ON c.servicio_id = s.id
       WHERE c.fecha >= CURDATE() 
         AND c.estado IN ('pendiente', 'confirmada')
       ORDER BY c.fecha ASC, c.hora ASC
       LIMIT ${limiteNum}`,
    );
    return rows;
  },

  async getIngresosReport(periodo, fechaInicio, fechaFin) {
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
  },

  async getHorarioByDay(barberoId, fecha) {
    const pool = getPool();
    const diaSemana = getDiaSemana(fecha);

    const [rows] = await pool.execute(
      `SELECT hora_inicio, hora_fin 
     FROM horarios_barbero 
     WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
      [barberoId, diaSemana],
    );

    return rows[0] || null;
  },
};

export default citaRepository;
