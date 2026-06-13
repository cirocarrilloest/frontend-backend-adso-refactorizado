// backend/src/repositories/citaRepository/crudQueries.js
import { getPool } from "../../config/db.js";

/**
 * CREAR NUEVA CITA
 * @param {Object} citaData - Datos de la cita
 * @returns {Promise<Object>} Cita creada
 *
 * Frontend: Formulario agendar cita
 * Backend relacionado: clienteCitaService.agendar, adminCitaService.crearCitaAdmin
 */
export const create = async (citaData) => {
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

  return findById(result.insertId);
};

/**
 * BUSCAR CITA POR ID (con joins)
 * @param {number} id - ID de la cita
 * @returns {Promise<Object|null>} Cita encontrada
 *
 * Frontend: Detalle de cita, validaciones
 * Backend relacionado: Todos los servicios que necesitan datos completos de cita
 */
export const findById = async (id) => {
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

/**
 * ACTUALIZAR CITA
 * @param {number} id - ID de la cita
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Cita actualizada
 *
 * Frontend: Editar cita, reagendar
 * Backend relacionado: adminCitaService.editarCitaAdmin, clienteCitaService.reagendar
 */
export const update = async (id, updates) => {
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

  if (fields.length === 0) return findById(id);

  fields.push("updated_at = NOW()");
  values.push(id);

  await pool.execute(
    `UPDATE citas SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
  return findById(id);
};

/**
 * ACTUALIZAR SOLO EL ESTADO DE LA CITA
 * @param {number} id - ID de la cita
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object|null>} Cita actualizada
 *
 * Frontend: Confirmar, finalizar, cancelar
 * Backend relacionado: barberoCitaService.confirmar, barberoCitaService.finalizar
 */
export const updateEstado = async (id, estado) => {
  return update(id, { estado });
};

/**
 * ELIMINAR CITA
 * @param {number} id - ID de la cita
 * @returns {Promise<boolean>} True si se eliminó
 *
 * Frontend: Admin - Eliminar cita
 * Backend relacionado: Admin (si se implementa)
 */
export const deleteCita = async (id) => {
  const pool = getPool();
  const [result] = await pool.execute("DELETE FROM citas WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
