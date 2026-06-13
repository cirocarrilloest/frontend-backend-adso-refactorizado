// backend/src/controllers/contactoController/helpers.js
import { ValidationError } from "../../utils/errors.js";

/**
 * VALIDAR EMAIL
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 * @throws {ValidationError} Si no es válido
 *
 * Frontend: Formulario de contacto
 * Backend relacionado: Validación antes de crear mensaje
 */
export const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("El email no es válido");
  }
  return true;
};

/**
 * VALIDAR CAMPOS DE CONTACTO
 * @param {Object} body - Cuerpo de la petición
 * @param {string} body.name - Nombre
 * @param {string} body.email - Email
 * @param {string} body.message - Mensaje
 * @throws {ValidationError} Si falta algún campo
 *
 * Frontend: Formulario de contacto
 * Backend relacionado: Validación antes de crear mensaje
 */
export const validarCamposContacto = ({ name, email, message }) => {
  if (!name || !email || !message) {
    throw new ValidationError("Nombre, email y mensaje son requeridos");
  }
  validarEmail(email);
};

/**
 * VALIDAR ARRAY DE IDs
 * @param {Array} ids - Array de IDs
 * @returns {boolean} True si es válido
 * @throws {ValidationError} Si no es válido
 *
 * Frontend: Eliminación múltiple
 * Backend relacionado: Validación antes de eliminar múltiples mensajes
 */
export const validarIdsArray = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError("Se requiere un array de IDs");
  }
  return true;
};

/**
 * VALIDAR RESPUESTA
 * @param {string} respuesta - Texto de respuesta
 * @throws {ValidationError} Si no hay respuesta
 *
 * Frontend: Modal responder mensaje
 * Backend relacionado: Validación antes de marcar como respondido
 */
export const validarRespuesta = (respuesta) => {
  if (!respuesta) {
    throw new ValidationError("Se requiere la respuesta");
  }
  return true;
};
