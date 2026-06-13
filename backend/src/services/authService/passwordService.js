// backend/src/services/authService/passwordService.js
import userRepository from "../../repositories/userRepository.js";
import { UnauthorizedError } from "../../utils/errors.js";
import {
  validarNuevaPassword,
  verificarPassword,
  validarYObtenerUsuario,
} from "./helpers.js";

/**
 * CAMBIAR CONTRASEÑA DEL USUARIO AUTENTICADO
 * @param {number} userId - ID del usuario
 * @param {Object} passwords - Contraseñas
 * @param {string} passwords.pass_actual - Contraseña actual
 * @param {string} passwords.pass_nueva - Contraseña nueva
 * @returns {Promise<void>}
 * @throws {ValidationError} Si la nueva contraseña es muy corta
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {UnauthorizedError} Si la contraseña actual es incorrecta
 *
 * Frontend: Formulario de cambio de contraseña
 * - Componente: CambiarPasswordForm
 * - Endpoint: PUT /api/auth/password
 * - Header: Authorization: Bearer <token>
 * - Body: { pass_actual, pass_nueva }
 *
 * Backend relacionado:
 * - userRepository.findById
 * - bcrypt.compare
 * - userRepository.update
 */
export const cambiarPassword = async (userId, { pass_actual, pass_nueva }) => {
  // 1. Validar nueva contraseña (mínimo 6 caracteres)
  validarNuevaPassword(pass_nueva, 6);

  // 2. Verificar que el usuario existe
  const usuario = await validarYObtenerUsuario(userId, "Usuario");

  // 3. Verificar que la contraseña actual es correcta
  await verificarPassword(
    pass_actual,
    usuario.pass,
    "La contraseña actual es incorrecta",
  );

  // 4. Actualizar la contraseña
  await userRepository.update(userId, { pass: pass_nueva });
};
