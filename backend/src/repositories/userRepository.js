// src/repositories/userRepository.js
// CORREGIDO - Elimina fecha_registro si no existe en tu tabla

import { getPool } from "../config/db.js";
import bcrypt from "bcryptjs";

export const userRepository = {
  /**
   * Obtiene un usuario por su ID (sin contraseña)
   * NOTA: Si tu tabla usa 'created_at' en lugar de 'fecha_registro', cámbialo
   */
  async findById(id) {
    const pool = getPool();
    // Opción 1: Si tienes 'created_at'
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, rol, telefono, created_at as fecha_registro 
       FROM usuarios WHERE id = ?`,
      [id],
    );
    // Opción 2: Si NO tienes fecha de registro, usa esto:
    // const [rows] = await pool.execute(
    //   `SELECT id, nombre, email, rol, telefono FROM usuarios WHERE id = ?`,
    //   [id]
    // );
    return rows[0] || null;
  },

  /**
   * Obtiene un usuario por su email (incluye contraseña)
   */
  async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, rol, pass, telefono FROM usuarios WHERE email = ?`,
      [email.toLowerCase()],
    );
    return rows[0] || null;
  },

  /**
   * Obtiene todos los usuarios con filtros
   */
  async findAll({ rol = null, search = null, limit = 100, offset = 0 } = {}) {
    const pool = getPool();
    let query = `SELECT id, nombre, email, rol, telefono FROM usuarios WHERE 1=1`;
    const params = [];

    if (rol) {
      query += ` AND rol = ?`;
      params.push(rol);
    }
    if (search) {
      query += ` AND (nombre LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY nombre ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Cuenta el total de usuarios
   */
  async count({ rol = null, search = null } = {}) {
    const pool = getPool();
    let query = `SELECT COUNT(*) as total FROM usuarios WHERE 1=1`;
    const params = [];

    if (rol) {
      query += ` AND rol = ?`;
      params.push(rol);
    }
    if (search) {
      query += ` AND (nombre LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  /**
   * Crea un nuevo usuario
   */
  async create(userData) {
    const pool = getPool();
    const { nombre, email, pass, rol = "cliente", telefono = null } = userData;

    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    );
    const hashedPassword = await bcrypt.hash(pass, salt);

    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, email, pass, rol, telefono, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [nombre, email.toLowerCase(), hashedPassword, rol, telefono],
    );

    return this.findById(result.insertId);
  },

  /**
   * Actualiza un usuario
   */
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
      values.push(updates.email.toLowerCase());
    }
    if (updates.telefono !== undefined) {
      fields.push("telefono = ?");
      values.push(updates.telefono || null);
    }
    if (updates.rol !== undefined) {
      fields.push("rol = ?");
      values.push(updates.rol);
    }
    if (updates.pass !== undefined) {
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
      );
      const hashedPassword = await bcrypt.hash(updates.pass, salt);
      fields.push("pass = ?");
      values.push(hashedPassword);
    }

    if (fields.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  },

  /**
   * Elimina un usuario
   */
  async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(`DELETE FROM usuarios WHERE id = ?`, [
      id,
    ]);
    return result.affectedRows > 0;
  },

  /**
   * Verifica si un email ya existe
   */
  async emailExists(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id FROM usuarios WHERE email = ?`,
      [email.toLowerCase()],
    );
    return rows.length > 0;
  },

  /**
   * Obtiene todos los barberos
   */
  async getBarberos() {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, telefono FROM usuarios WHERE rol = 'barbero' ORDER BY nombre`,
    );
    return rows;
  },

  /**
   * Obtiene perfil completo de barbero con estadísticas
   */
  async getBarberoPerfil(id) {
    const pool = getPool();

    const [barberoRows] = await pool.execute(
      `SELECT id, nombre, email, telefono FROM usuarios WHERE id = ? AND rol = 'barbero'`,
      [id],
    );
    if (barberoRows.length === 0) return null;

    const [statsRows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
        COALESCE(SUM(CASE WHEN estado = 'completada' THEN s.precio ELSE 0 END), 0) as ingresos_totales
       FROM citas c
       JOIN servicios s ON c.servicio_id = s.id
       WHERE c.barbero_id = ?`,
      [id],
    );

    const [serviciosRows] = await pool.execute(
      `SELECT s.id, s.nombre, s.precio, s.duracion, COUNT(*) as veces_realizado
       FROM citas c
       JOIN servicios s ON c.servicio_id = s.id
       WHERE c.barbero_id = ? AND c.estado = 'completada'
       GROUP BY s.id
       ORDER BY veces_realizado DESC
       LIMIT 5`,
      [id],
    );

    return {
      ...barberoRows[0],
      estadisticas: statsRows[0],
      servicios_frecuentes: serviciosRows,
    };
  },

  /**
   * Obtiene horario de un barbero
   */
  async getHorarioBarbero(barberoId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT dia_semana, hora_inicio, hora_fin, activo 
       FROM horarios_barbero 
       WHERE barbero_id = ? 
       ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')`,
      [barberoId],
    );
    return rows;
  },

  /**
   * Configura horario de un barbero
   */
  async setHorarioBarbero(barberoId, { dia_semana, hora_inicio, hora_fin }) {
    const pool = getPool();

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

    return { dia_semana, hora_inicio, hora_fin };
  },

  /**
   * Elimina horario de un barbero
   */
  async deleteHorarioBarbero(barberoId, dia_semana) {
    const pool = getPool();
    const [result] = await pool.execute(
      `DELETE FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ?`,
      [barberoId, dia_semana],
    );
    return result.affectedRows > 0;
  },
};

export default userRepository;
