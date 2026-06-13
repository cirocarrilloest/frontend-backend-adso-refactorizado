// backend/src/repositories/contactoRepository/crudQueries.js
import { getPool } from "../../config/db.js";

/**
 * CREAR NUEVO MENSAJE DE CONTACTO
 * @param {Object} datos - Datos del mensaje
 * @param {string} datos.nombre - Nombre del remitente
 * @param {string} datos.email - Email del remitente
 * @param {string} datos.mensaje - Mensaje
 * @returns {Promise<number>} ID del mensaje creado
 *
 * Frontend: Formulario de contacto (público)
 * - Componente: ContactoForm
 * - Endpoint: POST /api/contacto
 *
 * Backend relacionado: contactoController.crearMensaje
 */
export const crear = async ({ nombre, email, mensaje }) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO contacto_mensajes (nombre, email, mensaje, fecha, leido, respondido, fecha_respuesta)
     VALUES (?, ?, ?, NOW(), FALSE, FALSE, NULL)`,
    [nombre, email, mensaje],
  );
  return result.insertId;
};

/**
 * OBTENER MENSAJE POR ID
 * @param {number} id - ID del mensaje
 * @returns {Promise<Object|null>} Mensaje encontrado
 *
 * Frontend: Panel Admin - Detalle de mensaje
 * - Componente: MensajeDetalleModal
 * - Endpoint: GET /api/contacto/:id
 *
 * Backend relacionado: contactoController.getMensajeById
 */
export const getById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT * FROM contacto_mensajes WHERE id = ?",
    [id],
  );
  return rows[0] || null;
};

/**
 * ELIMINAR MENSAJE POR ID
 * @param {number} id - ID del mensaje
 * @returns {Promise<boolean>} True si se eliminó
 *
 * Frontend: Panel Admin - Botón eliminar mensaje
 * - Componente: EliminarMensajeButton
 * - Endpoint: DELETE /api/contacto/:id
 *
 * Backend relacionado: contactoController.eliminarMensaje
 */
export const eliminar = async (id) => {
  const pool = getPool();
  const [result] = await pool.execute(
    "DELETE FROM contacto_mensajes WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
};

/**
 * ELIMINAR MÚLTIPLES MENSAJES
 * @param {Array<number>} ids - Lista de IDs
 * @returns {Promise<number>} Cantidad eliminada
 *
 * Frontend: Panel Admin - Selección múltiple
 * - Componente: SeleccionarMensajes, EliminarSeleccionadosButton
 * - Endpoint: DELETE /api/contacto/eliminar-multiples
 *
 * Backend relacionado: contactoController.eliminarMultiples
 */
export const eliminarMultiples = async (ids) => {
  if (!ids || ids.length === 0) return 0;
  const pool = getPool();
  const placeholders = ids.map(() => "?").join(",");
  const [result] = await pool.execute(
    `DELETE FROM contacto_mensajes WHERE id IN (${placeholders})`,
    ids,
  );
  return result.affectedRows;
};
