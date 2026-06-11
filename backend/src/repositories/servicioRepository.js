// src/repositories/servicioRepository.js
import { getPool } from "../config/db.js";

/**
 * Repositorio de servicios.
 * Todas las consultas SQL relacionadas con servicios están aquí.
 */

export const servicioRepository = {
  /**
   * Obtiene todos los servicios
   */
  async findAll(soloActivos = false) {
    const pool = getPool();
    let query = `SELECT * FROM servicios`;
    const params = [];

    if (soloActivos) {
      query += ` WHERE activo = TRUE`;
    }

    query += ` ORDER BY nombre`;

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Obtiene un servicio por ID
   */
  async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(`SELECT * FROM servicios WHERE id = ?`, [
      id,
    ]);
    return rows[0] || null;
  },

  /**
   * Crea un nuevo servicio
   */
  async create(servicioData) {
    const pool = getPool();
    const {
      nombre,
      descripcion,
      duracion,
      precio,
      activo = true,
    } = servicioData;

    const [result] = await pool.execute(
      `INSERT INTO servicios (nombre, descripcion, duracion, precio, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, duracion, precio, activo],
    );

    return this.findById(result.insertId);
  },

  /**
   * Actualiza un servicio
   */
  async update(id, updates) {
    const pool = getPool();
    const fields = [];
    const values = [];

    if (updates.nombre !== undefined) {
      fields.push("nombre = ?");
      values.push(updates.nombre);
    }
    if (updates.descripcion !== undefined) {
      fields.push("descripcion = ?");
      values.push(updates.descripcion || null);
    }
    if (updates.duracion !== undefined) {
      fields.push("duracion = ?");
      values.push(updates.duracion);
    }
    if (updates.precio !== undefined) {
      fields.push("precio = ?");
      values.push(updates.precio);
    }
    if (updates.activo !== undefined) {
      fields.push("activo = ?");
      values.push(updates.activo);
    }

    if (fields.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE servicios SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  },

  /**
   * Elimina un servicio
   */
  async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(`DELETE FROM servicios WHERE id = ?`, [
      id,
    ]);
    return result.affectedRows > 0;
  },

  /**
   * Obtiene barberos que realizan un servicio específico
   */
  async getBarberosByServicioId(servicioId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT DISTINCT u.id, u.nombre, u.email, u.telefono
       FROM usuarios u
       WHERE u.rol = 'barbero'
       ORDER BY u.nombre`,
      [servicioId],
    );
    return rows;
  },

  /**
   * Verifica si un servicio está activo
   */
  async isActive(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT activo FROM servicios WHERE id = ?`,
      [id],
    );
    return rows[0]?.activo === true;
  },
};

export default servicioRepository;
