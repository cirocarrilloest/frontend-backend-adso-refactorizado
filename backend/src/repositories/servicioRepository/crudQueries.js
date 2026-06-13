// backend/src/repositories/servicioRepository/crudQueries.js
import { getPool } from "../../config/db.js";
import {
  prepararActualizaciones,
  tieneCamposParaActualizar,
} from "./helpers.js";

/**
 * OBTENER TODOS LOS SERVICIOS
 * @param {boolean} soloActivos - Si es true, solo retorna servicios activos
 * @returns {Promise<Array>} Lista de servicios
 *
 * Frontend:
 * - Cliente: Selector de servicio al agendar cita
 * - Admin: Tabla de servicios
 * - Endpoint: GET /api/servicios?activos=true
 *
 * Backend relacionado: servicioController.getServicios
 *
 * Ejemplo de respuesta:
 * [
 *   { id: 1, nombre: "Corte de cabello", duracion: 30, precio: 5000, activo: true },
 *   { id: 2, nombre: "Barba", duracion: 20, precio: 3000, activo: true }
 * ]
 */
export const findAll = async (soloActivos = false) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  let query = `SELECT * FROM servicios`;
  const params = [];

  if (soloActivos) {
    query += ` WHERE activo = TRUE`;
  }

  query += ` ORDER BY nombre`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * OBTENER SERVICIO POR ID
 * @param {number} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio encontrado o null
 *
 * Frontend:
 * - Detalle de servicio (Admin)
 * - Verificar servicio al agendar cita
 * - Endpoint: GET /api/servicios/:id
 *
 * Backend relacionado: servicioController.getServicioById
 *
 * Ejemplo de respuesta:
 * {
 *   id: 1,
 *   nombre: "Corte de cabello",
 *   descripcion: "Corte con máquina y tijera",
 *   duracion: 30,
 *   precio: 5000,
 *   activo: true,
 *   created_at: "2024-01-01 10:00:00",
 *   updated_at: "2024-01-01 10:00:00"
 * }
 */
export const findById = async (id) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [rows] = await pool.execute(`SELECT * FROM servicios WHERE id = ?`, [
    id,
  ]);
  return rows[0] || null;
};

/**
 * CREAR NUEVO SERVICIO
 * @param {Object} servicioData - Datos del servicio
 * @param {string} servicioData.nombre - Nombre del servicio
 * @param {string} servicioData.descripcion - Descripción (opcional)
 * @param {number} servicioData.duracion - Duración en minutos
 * @param {number} servicioData.precio - Precio del servicio
 * @param {boolean} servicioData.activo - Estado activo (default: true)
 * @returns {Promise<Object>} Servicio creado
 *
 * Frontend: Panel Admin - Formulario crear servicio
 * - Componente: CrearServicioForm
 * - Endpoint: POST /api/servicios
 * - Body: { nombre, descripcion, duracion, precio, activo }
 *
 * Backend relacionado: servicioController.crearServicio
 */
export const create = async (servicioData) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const { nombre, descripcion, duracion, precio, activo = true } = servicioData;

  const [result] = await pool.execute(
    `INSERT INTO servicios (nombre, descripcion, duracion, precio, activo) 
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, descripcion || null, duracion, precio, activo],
  );

  return findById(result.insertId);
};

/**
 * ACTUALIZAR SERVICIO
 * @param {number} id - ID del servicio
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Servicio actualizado o null
 *
 * Frontend: Panel Admin - Formulario editar servicio
 * - Componente: EditarServicioModal
 * - Endpoint: PUT /api/servicios/:id
 * - Body: { nombre, descripcion, duracion, precio, activo }
 *
 * Backend relacionado: servicioController.actualizarServicio
 */
export const update = async (id, updates) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await

  // Preparar solo los campos válidos
  const actualizaciones = prepararActualizaciones(updates);

  // Verificar si hay campos para actualizar
  if (!tieneCamposParaActualizar(actualizaciones)) {
    return findById(id);
  }

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(actualizaciones)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE servicios SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );

  return findById(id);
};

/**
 * ELIMINAR SERVICIO
 * @param {number} id - ID del servicio
 * @returns {Promise<boolean>} True si se eliminó, false en caso contrario
 *
 * Frontend: Panel Admin - Botón eliminar servicio
 * - Componente: EliminarServicioButton
 * - Endpoint: DELETE /api/servicios/:id
 *
 * Backend relacionado: servicioController.eliminarServicio
 *
 * Nota: Puede fallar si el servicio tiene citas asociadas (foreign key)
 */
export const deleteServicio = async (id) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [result] = await pool.execute(`DELETE FROM servicios WHERE id = ?`, [
    id,
  ]);
  return result.affectedRows > 0;
};
