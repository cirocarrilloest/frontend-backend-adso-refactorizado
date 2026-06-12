// src/repositories/userRepository.js
import { getPool } from "../config/db.js";
import bcrypt from "bcryptjs";

export const userRepository = {
  async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, pass, rol, telefono, created_at, updated_at
       FROM usuarios WHERE email = ?`,
      [email],
    );
    return rows[0] || null;
  },

  async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, pass, rol, telefono, created_at, updated_at
       FROM usuarios WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  },

  async emailExists(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );
    return rows.length > 0;
  },

  async create(userData) {
    const pool = getPool();
    const { nombre, email, pass, rol = "cliente", telefono = null } = userData;
    const hashedPassword = await bcrypt.hash(pass, 10);
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, pass, rol, telefono) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, email, hashedPassword, rol, telefono],
    );
    return this.findById(result.insertId);
  },

  async update(id, updates) {
    const pool = getPool();
    const fields = [];
    const values = [];

    if (updates.nombre !== undefined) {
      fields.push("nombre = ?");
      values.push(updates.nombre);
    }
    if (updates.email !== undefined) {
      fields.push("email = ?");
      values.push(updates.email);
    }
    if (updates.telefono !== undefined) {
      fields.push("telefono = ?");
      values.push(updates.telefono);
    }
    if (updates.rol !== undefined) {
      fields.push("rol = ?");
      values.push(updates.rol);
    }
    if (updates.pass !== undefined) {
      fields.push("pass = ?");
      values.push(await bcrypt.hash(updates.pass, 10));
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.execute(
      `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return this.findById(id);
  },

  async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute("DELETE FROM usuarios WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },

  async findAll({ rol, search } = {}) {
    const pool = getPool();
    let query = `SELECT id, nombre, email, rol, telefono, created_at, updated_at FROM usuarios WHERE 1=1`;
    const params = [];

    if (rol) {
      query += ` AND rol = ?`;
      params.push(rol);
    }
    if (search) {
      query += ` AND (nombre LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ` ORDER BY nombre`;
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async getBarberos() {
    return this.findAll({ rol: "barbero" });
  },

  async getHorarioBarbero(barberoId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM horarios_barbero WHERE barbero_id = ? AND activo = TRUE 
       ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')`,
      [barberoId],
    );
    return rows;
  },

  async setHorarioBarbero(barberoId, { dia_semana, hora_inicio, hora_fin }) {
    const pool = getPool();

    // Validar que hora_inicio < hora_fin
    if (hora_inicio >= hora_fin) {
      throw new Error("La hora de inicio debe ser menor que la hora de fin");
    }

    const [existing] = await pool.execute(
      `SELECT id FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ?`,
      [barberoId, dia_semana],
    );

    if (existing.length > 0) {
      await pool.execute(
        `UPDATE horarios_barbero SET hora_inicio = ?, hora_fin = ?, activo = TRUE 
         WHERE barbero_id = ? AND dia_semana = ?`,
        [hora_inicio, hora_fin, barberoId, dia_semana],
      );
    } else {
      await pool.execute(
        `INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin, activo) 
         VALUES (?, ?, ?, ?, TRUE)`,
        [barberoId, dia_semana, hora_inicio, hora_fin],
      );
    }
    return { barbero_id: barberoId, dia_semana, hora_inicio, hora_fin };
  },

  async deleteHorarioBarbero(barberoId, diaSemana) {
    const pool = getPool();
    const [result] = await pool.execute(
      `DELETE FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ?`,
      [barberoId, diaSemana],
    );
    return result.affectedRows > 0;
  },
};

export default userRepository;
