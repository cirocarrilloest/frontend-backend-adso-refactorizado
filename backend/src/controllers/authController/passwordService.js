// backend/src/controllers/authController/passwordService.js
import * as authService from "../../services/authService.js";
import { ok } from "../../utils/responseUtils.js";
import { validarCamposPassword } from "./helpers.js";

/**
 * CAMBIAR CONTRASEÑA DEL USUARIO AUTENTICADO
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Formulario de cambio de contraseña
 * - Componente: CambiarPasswordForm
 * - Endpoint: PUT /api/auth/password
 * - Header: Authorization: Bearer <token>
 * - Body: { pass_actual, pass_nueva }
 *
 * Backend relacionado:
 * - validarCamposPassword
 * - authService.cambiarPassword
 */
export const cambiarPassword = async (req, res, next) => {
  try {
    const { pass_actual, pass_nueva } = req.body;

    // Validar campos requeridos
    validarCamposPassword({ pass_actual, pass_nueva }, res);

    await authService.cambiarPassword(req.usuario.id, {
      pass_actual,
      pass_nueva,
    });

    return ok(res, { message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    next(error);
  }
};
