// backend/src/services/authService/helpers.js
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors.js";
import bcrypt from "bcryptjs";
import userRepository from "../../repositories/userRepository.js";

/**
 * VALIDAR CONTRASEÑA NUEVA
 * @param {string} password - Contraseña a validar
 * @param {number} minLength - Longitud mínima (default: 6)
 * @throws {ValidationError} Si la contraseña es muy corta
 *
 * Frontend: Formulario de cambio de contraseña
 * Backend relacionado: cambiarPassword
 */
export const validarNuevaPassword = (password, minLength = 6) => {
  if (!password || password.length < minLength) {
    throw new ValidationError(
      `La nueva contraseña debe tener al menos ${minLength} caracteres`,
    );
  }
  return true;
};

/**
 * VERIFICAR CONTRASEÑA DEL USUARIO
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña encriptada
 * @returns {Promise<boolean>} True si son iguales
 * @throws {UnauthorizedError} Si no coinciden
 *
 * Frontend: Login, cambio de contraseña
 * Backend relacionado: ingresar, cambiarPassword
 */
export const verificarPassword = async (
  plainPassword,
  hashedPassword,
  mensajeError = "Credenciales inválidas",
) => {
  const esValida = await bcrypt.compare(plainPassword, hashedPassword);
  if (!esValida) {
    throw new UnauthorizedError(mensajeError);
  }
  return true;
};

/**
 * VALIDAR Y OBTENER USUARIO POR ID
 * @param {number} userId - ID del usuario
 * @param {string} errorMessage - Mensaje de error personalizado
 * @returns {Promise<Object>} Usuario encontrado
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Obtener perfil, cambiar contraseña
 * Backend relacionado: obtenerPerfil, cambiarPassword
 */
export const validarYObtenerUsuario = async (
  userId,
  errorMessage = "Usuario",
) => {
  const usuario = await userRepository.findById(userId);
  if (!usuario) {
    throw new NotFoundError(errorMessage);
  }
  return usuario;
};

/**
 * VALIDAR Y OBTENER BARBERO POR ID
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Object>} Barbero encontrado
 * @throws {NotFoundError} Si no existe o no es barbero
 *
 * Frontend: Ver perfil público de barbero
 * Backend relacionado: obtenerPerfilBarbero
 */
export const validarYObtenerBarbero = async (barberoId) => {
  const perfil = await userRepository.findById(barberoId);
  if (!perfil || perfil.rol !== "barbero") {
    throw new NotFoundError("Barbero");
  }
  return perfil;
};

/**
 * ELIMINAR CONTRASEÑA DEL OBJETO USUARIO
 * @param {Object} usuario - Objeto usuario con contraseña
 * @returns {Object} Usuario sin contraseña
 *
 * Frontend: Enviar datos de usuario seguros
 * Backend relacionado: registrar, ingresar
 */
export const quitarPassword = (usuario) => {
  const { pass: _, ...usuarioSinPass } = usuario;
  return usuarioSinPass;
};
