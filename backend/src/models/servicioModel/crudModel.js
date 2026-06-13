// backend/src/models/servicioModel/crudModel.js
import { getPool } from "../../config/db.js";
import { validarDatosServicio, prepararDatosActualizacion } from "./helpers.js";

/**
 * CREAR NUEVO SERVICIO
 * @param {Object} servicioData - Datos del servicio
 * @param {string} servicioData.nombre - Nombre del servicio
 * @param {string} servicioData.descripcion - Descripción (opcional)
 * @param {number} servicioData.duracion - Duración en minutos
 * @param {number} servicioData.precio - Precio del servicio
 * @param {boolean} servicioData.activo - Estado activo (default: true)
 * @returns {Promise<Object>} Servicio creado
 * @throws {Error} Si faltan campos requeridos
 *
 * Frontend: Panel Admin - Formulario crear servicio
 * - Componente: CrearServicioForm
 * - Endpoint: POST /api/servicios
 * - Body: { nombre, descripcion, duracion, precio, activo }
 *
 * Backend relacionado:
 * - servicioController.crearServicio
 * - servicioRepository.create
 *
 * Ejemplo de respuesta:
 * {
 *   id: 1,
 *   nombre: "Corte de cabello",
 *   descripcion: "Corte moderno",
 *   duracion: 30,
 *   precio: 5000,
 *   activo: true,
 *   created_at: "2024-01-01 10:00:00",
 *   updated_at: "2024-01-01 10:00:00"
 * }
 */
export const createServicio = async (servicioData) => {
  const pool = getPool();
  const { nombre, descripcion, duracion, precio, activo = true } = servicioData;

  // Validar datos requeridos
  validarDatosServicio({ nombre, duracion, precio });

  const query = `
    INSERT INTO servicios (nombre, descripcion, duracion, precio, activo)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [
    nombre,
    descripcion || null,
    duracion,
    precio,
    activo,
  ]);

  return getServicioById(result.insertId);
};

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
 * Backend relacionado:
 * - servicioController.getServicios
 * - servicioRepository.findAll
 *
 * Ejemplo de respuesta:
 * [
 *   { id: 1, nombre: "Corte de cabello", duracion: 30, precio: 5000, activo: true },
 *   { id: 2, nombre: "Barba", duracion: 20, precio: 3000, activo: true }
 * ]
 */
export const getAllServicios = async (soloActivos = false) => {
  const pool = getPool();
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
 * Backend relacionado:
 * - servicioController.getServicioById
 * - servicioRepository.findById
 * - clienteCitaService.agendar (validar servicio)
 *
 * Ejemplo de respuesta:
 * {
 *   id: 1,
 *   nombre: "Corte de cabello",
 *   descripcion: "Corte moderno con máquina",
 *   duracion: 30,
 *   precio: 5000,
 *   activo: true,
 *   created_at: "2024-01-01 10:00:00",
 *   updated_at: "2024-01-01 10:00:00"
 * }
 */
export const getServicioById = async (id) => {
  const pool = getPool();
  const query = `SELECT * FROM servicios WHERE id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

/**
 * ACTUALIZAR SERVICIO
 * @param {number} id - ID del servicio
 * @param {Object} servicioData - Datos a actualizar
 * @returns {Promise<Object|null>} Servicio actualizado o null
 *
 * Frontend: Panel Admin - Formulario editar servicio
 * - Componente: EditarServicioModal
 * - Endpoint: PUT /api/servicios/:id
 * - Body: { nombre, descripcion, duracion, precio, activo }
 *
 * Backend relacionado:
 * - servicioController.actualizarServicio
 * - servicioRepository.update
 */
export const updateServicio = async (id, servicioData) => {
  const pool = getPool();

  // Preparar solo los campos válidos
  const datosActualizados = prepararDatosActualizacion(servicioData);

  if (Object.keys(datosActualizados).length === 0) {
    return getServicioById(id);
  }

  // Construir query dinámicamente
  const campos = [];
  const valores = [];

  for (const [key, value] of Object.entries(datosActualizados)) {
    campos.push(`${key} = ?`);
    valores.push(value);
  }

  valores.push(id);

  const query = `
    UPDATE servicios 
    SET ${campos.join(", ")}
    WHERE id = ?
  `;

  const [result] = await pool.execute(query, valores);

  if (result.affectedRows > 0) {
    return getServicioById(id);
  }
  return null;
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
 * Backend relacionado:
 * - servicioController.eliminarServicio
 * - servicioRepository.delete
 *
 * Nota: Puede fallar si el servicio tiene citas asociadas (foreign key)
 */
export const deleteServicio = async (id) => {
  const pool = getPool();
  const query = `DELETE FROM servicios WHERE id = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};
