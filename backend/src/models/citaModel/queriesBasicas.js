// backend/src/models/citaModel/queriesBasicas.js
import { getPool } from "../../config/db.js";

/**
 * CREAR NUEVA CITA
 * @param {Object} citaData - Datos de la cita
 * @returns {Promise<Object>} Cita creada
 *
 * Frontend: Formulario de agendar cita
 * Backend relacionado: citaService.agendarCita
 */
export const createCita = async (citaData) => {
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
    "INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, notas, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [cliente_id, barbero_id, servicio_id, fecha, hora, notas || null, estado],
  );
  return getCitaById(result.insertId);
};

/**
 * OBTENER CITA POR ID (con joins para datos relacionados)
 * @param {number} id - ID de la cita
 * @returns {Promise<Object|null>} Cita encontrada
 *
 * Frontend: Detalle de cita, verificar permisos
 * Backend relacionado: citaController.getCitaById
 */
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

/**
 * ACTUALIZAR CITA (parcial)
 * @param {number} id - ID de la cita
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object|null>} Cita actualizada
 *
 * Frontend: Editar cita, reagendar
 * Backend relacionado: citaService.reagendarCita
 */
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

  updates.push("updated_at = NOW()");
  values.push(id);

  const [result] = await pool.execute(
    `UPDATE citas SET ${updates.join(", ")} WHERE id = ?`,
    values,
  );
  return result.affectedRows > 0 ? getCitaById(id) : null;
};

/**
 * ACTUALIZAR SOLO EL ESTADO DE LA CITA
 * @param {number} id - ID de la cita
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object|null>} Cita actualizada
 *
 * Frontend: Confirmar, finalizar, cancelar cita
 * Backend relacionado: citaService.confirmarCita, citaService.finalizarCita
 */
export const updateCitaEstado = async (id, estado) => {
  const pool = getPool();
  const [result] = await pool.execute(
    "UPDATE citas SET estado = ?, updated_at = NOW() WHERE id = ?",
    [estado, id],
  );
  return result.affectedRows > 0 ? getCitaById(id) : null;
};

/**
 * ACTUALIZAR CITA COMPLETAMENTE (admin)
 * @param {number} id - ID de la cita
 * @param {Object} citaData - Todos los datos de la cita
 * @returns {Promise<Object|null>} Cita actualizada
 *
 * Frontend: Panel Admin - Editar cita
 * Backend relacionado: citaService.editarCitaAdmin
 */
export const updateCitaAdmin = async (id, citaData) => {
  const pool = getPool();
  const { cliente_id, barbero_id, servicio_id, fecha, hora, estado, notas } =
    citaData;

  const updates = [];
  const values = [];

  if (cliente_id !== undefined) {
    updates.push("cliente_id = ?");
    values.push(cliente_id);
  }
  if (barbero_id !== undefined) {
    updates.push("barbero_id = ?");
    values.push(barbero_id);
  }
  if (servicio_id !== undefined) {
    updates.push("servicio_id = ?");
    values.push(servicio_id);
  }
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
    values.push(notas || null);
  }

  if (updates.length > 0) {
    updates.push("updated_at = NOW()");
    values.push(id);
    await pool.execute(
      `UPDATE citas SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );
  }
  return getCitaById(id);
};

/**
 * CANCELAR CITA (cambiar estado a cancelada)
 * @param {number} id - ID de la cita
 * @returns {Promise<Object|null>} Cita cancelada
 *
 * Frontend: Botón cancelar cita
 * Backend relacionado: citaService.cancelarCita
 */
export const cancelarCita = async (id) => updateCitaEstado(id, "cancelada");

/**
 * VERIFICAR SI EXISTE CITA DUPLICADA EN EL MISMO HORARIO
 * @param {number} barbero_id - ID del barbero
 * @param {string} fecha - Fecha
 * @param {string} hora - Hora
 * @param {number|null} excludeId - ID a excluir (para edición)
 * @returns {Promise<boolean>} True si existe duplicado
 *
 * Frontend: Validación en tiempo real al agendar
 * Backend relacionado: citaService.agendarCita
 */
export const verificarDuplicado = async (
  barbero_id,
  fecha,
  hora,
  excludeId = null,
) => {
  const pool = getPool();
  let query = `SELECT id FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')`;
  const params = [barbero_id, fecha, hora];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  const [rows] = await pool.execute(query, params);
  return rows.length > 0;
};
