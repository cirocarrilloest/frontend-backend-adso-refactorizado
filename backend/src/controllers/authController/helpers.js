// backend/src/controllers/authController/helpers.js
import { badRequest } from "../../utils/responseUtils.js";
import { ValidationError } from "../../utils/errors.js";

/**
 * EXTRAER TOKEN DEL HEADER AUTHORIZATION
 * @param {string} authHeader - Header Authorization
 * @returns {string} Token extraído
 * @throws {ValidationError} Si no hay token
 *
 * Frontend: Envío de token en cada petición
 * Backend relacionado: logoutUsuario
 */
export const extraerToken = (authHeader) => {
  if (!authHeader) {
    throw new ValidationError("No se proporcionó token");
  }
  return authHeader.substring(7);
};

/**
 * VALIDAR CAMPOS DE CAMBIO DE CONTRASEÑA
 * @param {Object} body - Cuerpo de la petición
 * @param {string} body.pass_actual - Contraseña actual
 * @param {string} body.pass_nueva - Contraseña nueva
 * @param {Object} res - Express response
 * @throws {ValidationError} Si faltan campos
 *
 * Frontend: Formulario de cambio de contraseña
 * Backend relacionado: cambiarPassword
 */
export const validarCamposPassword = ({ pass_actual, pass_nueva }, res) => {
  if (!pass_actual || !pass_nueva) {
    throw new ValidationError("Se requiere pass_actual y pass_nueva");
  }
  return true;
};

/**
 * VALIDAR DATOS DE REGISTRO
 * @param {Object} body - Cuerpo de la petición
 * @returns {boolean} True si son válidos
 * @throws {ValidationError} Si faltan campos
 *
 * Frontend: Formulario de registro
 * Backend relacionado: registrarUsuario
 */
export const validarRegistroBasico = ({ nombre, email, password }) => {
  if (!nombre || !email || !password) {
    throw new ValidationError("Nombre, email y contraseña son requeridos");
  }
  return true;
};
