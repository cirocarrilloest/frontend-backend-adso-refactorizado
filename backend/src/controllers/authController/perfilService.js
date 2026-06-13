// backend/src/controllers/authController/perfilService.js
import * as authService from "../../services/authService.js";
import { ok } from "../../utils/responseUtils.js";

/**
 * OBTENER PERFIL DEL USUARIO AUTENTICADO
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel de perfil de usuario
 * - Componente: MiPerfil
 * - Endpoint: GET /api/auth/perfil
 * - Header: Authorization: Bearer <token>
 *
 * Backend relacionado: authService.obtenerPerfil
 */
export const getPerfilUsuario = async (req, res, next) => {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario.id);
    return ok(res, { usuario });
  } catch (error) {
    next(error);
  }
};

/**
 * OBTENER PERFIL PÚBLICO DE UN BARBERO
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Página pública del barbero
 * - Componente: BarberoPerfilPublico
 * - Endpoint: GET /api/auth/barbero/:id/perfil
 *
 * Backend relacionado: authService.obtenerPerfilBarbero
 */
export const getPerfilBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const perfil = await authService.obtenerPerfilBarbero(parseInt(id));
    return ok(res, { barbero: perfil });
  } catch (error) {
    next(error);
  }
};
