// backend/src/repositories/contactoRepository.js
import { getPool } from "../config/db.js";

export const contactoRepository = {
  /**
   * Inserta un nuevo mensaje de contacto
   */
  async crear({ nombre, email, mensaje }) {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO contacto_mensajes (nombre, email, mensaje, fecha, leido)
       VALUES (?, ?, ?, NOW(), FALSE)`,
      [nombre, email, mensaje],
    );
    return result.insertId;
  },

  /**
   * Retorna todos los mensajes
   */
  async getAll({ soloNoLeidos = false, limite = 50 } = {}) {
    const pool = getPool();
    const limiteNum = Math.max(1, Math.min(100, parseInt(limite) || 50));

    let query = "SELECT * FROM contacto_mensajes";
    const params = [];

    if (soloNoLeidos) {
      query += " WHERE leido = FALSE";
    }

    query += ` ORDER BY fecha DESC LIMIT ${limiteNum}`;

    const [rows] = await pool.execute(query, params);
    return rows;
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
