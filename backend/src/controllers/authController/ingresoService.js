// backend/src/controllers/authController/ingresoService.js
import * as authService from "../../services/authService.js";
import { ok, badRequest } from "../../utils/responseUtils.js";
import { extraerToken } from "./helpers.js";

/**
 * INGRESAR USUARIO (login) - público
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Formulario de login
 * - Componente: LoginForm
 * - Endpoint: POST /api/auth/ingreso
 * - Body: { email, password }
 *
 * Backend relacionado:
 * - authService.ingresar
 */
export const ingresarUsuario = async (req, res, next) => {
  try {
    const { token, user } = await authService.ingresar(req.body);

    return ok(res, {
      message: "Ingreso exitoso",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CERRAR SESIÓN (logout) - autenticado
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Botón de cerrar sesión
 * - Componente: LogoutButton
 * - Endpoint: POST /api/auth/logout
 * - Header: Authorization: Bearer <token>
 *
 * Backend relacionado:
 * - extraerToken
 * - authService.logout
 */
export const logoutUsuario = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = extraerToken(authHeader);

    await authService.logout(token);

    return ok(res, { message: "Sesión cerrada exitosamente" });
  } catch (error) {
    next(error);
  }
};
