// backend/src/services/authService/ingresoService.js
import userRepository from "../../repositories/userRepository.js";
import { generarToken, invalidarToken } from "../tokenService.js";
import { ValidationError, UnauthorizedError } from "../../utils/errors.js";
import { validarIngreso } from "../../utils/validador.js";
import { verificarPassword, quitarPassword } from "./helpers.js";

/**
 * INGRESAR USUARIO (login) - público
 * @param {Object} credentials - Credenciales
 * @param {string} credentials.email - Email
 * @param {string} credentials.pass - Contraseña
 * @returns {Promise<{token: string, user: Object}>} Token y usuario sin contraseña
 * @throws {ValidationError} Si los datos no son válidos
 * @throws {UnauthorizedError} Si las credenciales son inválidas
 *
 * Frontend: Formulario de login
 * - Componente: LoginForm
 * - Endpoint: POST /api/auth/ingreso
 * - Body: { email, pass }
 *
 * Backend relacionado:
 * - validarIngreso (validador)
 * - userRepository.findByEmail
 * - bcrypt.compare
 * - generarToken (tokenService)
 */
export const ingresar = async ({ email, pass }) => {
  // 1. Validar datos de entrada
  const { error } = validarIngreso({ email, pass });
  if (error) {
    throw new ValidationError(error.details.map((e) => e.message).join(", "));
  }

  // 2. Buscar usuario por email
  const usuario = await userRepository.findByEmail(email);
  if (!usuario) {
    throw new UnauthorizedError("Credenciales inválidas");
  }

  // 3. Verificar contraseña
  await verificarPassword(pass, usuario.pass, "Credenciales inválidas");

  // 4. Generar token JWT
  const token = generarToken(usuario.id, usuario.email, usuario.rol);

  // 5. Retornar token y usuario sin contraseña
  return { token, user: quitarPassword(usuario) };
};

/**
 * CERRAR SESIÓN (logout) - autenticado
 * @param {string} token - Token JWT a invalidar
 * @returns {void}
 *
 * Frontend: Botón de cerrar sesión
 * - Componente: LogoutButton
 * - Endpoint: POST /api/auth/logout
 * - Header: Authorization: Bearer <token>
 *
 * Backend relacionado: invalidarToken (tokenService)
 */
export const logout = async (token) => {
  invalidarToken(token);
};
