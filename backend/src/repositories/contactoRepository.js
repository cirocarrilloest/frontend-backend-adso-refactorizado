// backend/src/repositories/contactoRepository.js
import { getPool } from "../config/db.js";

export const contactoRepository = {
  /**
   * Inserta un nuevo mensaje de contacto
   */
  async crear({ nombre, email, mensaje }) {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO contacto_mensajes (nombre, email, mensaje, fecha, leido, respondido, fecha_respuesta)
       VALUES (?, ?, ?, NOW(), FALSE, FALSE, NULL)`,
      [nombre, email, mensaje],
    );
    return result.insertId;
  },

  /**
   * Retorna todos los mensajes con paginación y filtros
   */
  async getAll({
    soloNoLeidos = false,
    soloNoRespondidos = false,
    search = "",
    page = 1,
    limit = 20,
  } = {}) {
    const pool = getPool();
    const offset = (page - 1) * limit;
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

    let query = "SELECT * FROM contacto_mensajes WHERE 1=1";
    const params = [];

    if (soloNoLeidos) {
      query += " AND leido = FALSE";
    }

    if (soloNoRespondidos) {
      query += " AND respondido = FALSE";
    }

    if (search && search.trim()) {
      query += " AND (nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)";
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY 
                CASE WHEN leido = FALSE THEN 0 ELSE 1 END,
                fecha DESC 
                LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await pool.execute(query, params);

    // Obtener total para paginación
    let countQuery =
      "SELECT COUNT(*) as total FROM contacto_mensajes WHERE 1=1";
    const countParams = [];

    if (soloNoLeidos) {
      countQuery += " AND leido = FALSE";
      countParams.push();
    }
    if (soloNoRespondidos) {
      countQuery += " AND respondido = FALSE";
      countParams.push();
    }
    if (search && search.trim()) {
      countQuery += " AND (nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)";
      const searchTerm = `%${search.trim()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countRows] = await pool.execute(countQuery, countParams);
    const total = countRows[0]?.total || 0;

    return {
      mensajes: rows,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  /**
   * Obtener mensaje por ID
   */
  async getById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM contacto_mensajes WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },

  /**
   * Marca un mensaje como leído
   */
  async marcarLeido(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      "UPDATE contacto_mensajes SET leido = TRUE WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  /**
   * Marcar mensaje como respondido
   */
  async marcarRespondido(id, respuesta = null) {
    const pool = getPool();
    const [result] = await pool.execute(
      `UPDATE contacto_mensajes 
       SET respondido = TRUE, 
           respuesta = ?, 
           fecha_respuesta = NOW() 
       WHERE id = ?`,
      [respuesta, id],
    );
    return result.affectedRows > 0;
  },

  /**
   * Eliminar mensaje
   */
  async eliminar(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      "DELETE FROM contacto_mensajes WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  /**
   * Eliminar múltiples mensajes
   */
  async eliminarMultiples(ids) {
    if (!ids || ids.length === 0) return 0;
    const pool = getPool();
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await pool.execute(
      `DELETE FROM contacto_mensajes WHERE id IN (${placeholders})`,
      ids,
    );
    return result.affectedRows;
  },

  /**
   * Obtener estadísticas de mensajes
   */
  async getEstadisticas() {
    const pool = getPool();

    const [totales] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN leido = FALSE THEN 1 ELSE 0 END) as no_leidos,
        SUM(CASE WHEN respondido = FALSE THEN 1 ELSE 0 END) as no_respondidos,
        SUM(CASE WHEN DATE(fecha) = CURDATE() THEN 1 ELSE 0 END) as hoy
       FROM contacto_mensajes`,
    );

    const [porMes] = await pool.execute(
      `SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        COUNT(*) as total
       FROM contacto_mensajes
       WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(fecha, '%Y-%m')
       ORDER BY mes ASC`,
    );

    return {
      total: totales[0]?.total || 0,
      no_leidos: totales[0]?.no_leidos || 0,
      no_respondidos: totales[0]?.no_respondidos || 0,
      hoy: totales[0]?.hoy || 0,
      tendencia: porMes,
    };
  },

  /**
   * Obtiene los IDs de todos los usuarios admin
   */
  async getAdminIds() {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id FROM usuarios WHERE rol = 'admin'",
    );
    return rows.map((r) => r.id);
  },
};

export default contactoRepository;
