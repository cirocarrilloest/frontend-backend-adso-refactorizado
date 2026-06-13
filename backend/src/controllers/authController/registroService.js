// backend/src/controllers/authController/registroService.js
import * as authService from "../../services/authService.js";
import { created } from "../../utils/responseUtils.js";
import { validarRegistroBasico } from "./helpers.js";

/**
 * REGISTRAR NUEVO USUARIO (público)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Formulario de registro de usuario
 * - Componente: RegistroForm
 * - Endpoint: POST /api/auth/registro
 * - Body: { nombre, email, password, telefono, rol }
 *
 * Backend relacionado:
 * - validarRegistroBasico
 * - authService.registrar
 */
export const registrarUsuario = async (req, res, next) => {
  try {
    // Validación básica de campos requeridos
    validarRegistroBasico(req.body);

    const result = await authService.registrar(req.body);

    return created(res, {
      message: "Usuario registrado exitosamente",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};
