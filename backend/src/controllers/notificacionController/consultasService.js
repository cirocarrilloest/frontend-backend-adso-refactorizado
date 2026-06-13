// backend/src/controllers/notificacionController/consultasService.js
import { notificacionService } from "../../services/notificacionService.js";
import { ok } from "../../utils/responseUtils.js";
import { validarParametrosConsulta } from "./helpers.js";

/**
 * OBTENER NOTIFICACIONES DEL USUARIO AUTENTICADO
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel de notificaciones (campana)
 * - Componente: NotificacionesDropdown, NotificacionesList
 * - Endpoint: GET /api/notificaciones?soloNoLeidas=false&limite=20
 * - Query params: soloNoLeidas (boolean), limite (number)
 *
 * Backend relacionado: notificacionService.getByUsuario
 */
export const getMisNotificaciones = async (req, res, next) => {
  try {
    const { soloNoLeidas, limite } = validarParametrosConsulta(req.query);

    const notificaciones = await notificacionService.getByUsuario(
      req.usuario.id,
      soloNoLeidas,
      limite,
    );

    return ok(res, { notificaciones });
  } catch (error) {
    next(error);
  }
};

/**
 * CONTAR NOTIFICACIONES NO LEÍDAS DEL USUARIO
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Badge del icono de notificaciones
 * - Componente: NotificacionesBadge
 * - Endpoint: GET /api/notificaciones/contar-no-leidas
 *
 * Backend relacionado: notificacionService.contarNoLeidas
 */
export const contarNoLeidas = async (req, res, next) => {
  try {
    const total = await notificacionService.contarNoLeidas(req.usuario.id);
    return ok(res, { total });
  } catch (error) {
    next(error);
  }
};
