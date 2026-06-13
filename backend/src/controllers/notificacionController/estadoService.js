// backend/src/controllers/notificacionController/estadoService.js
import { notificacionService } from "../../services/notificacionService.js";
import { ok, notFound } from "../../utils/responseUtils.js";

/**
 * MARCAR NOTIFICACIÓN COMO LEÍDA (individual)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Al hacer clic en una notificación
 * - Componente: NotificacionItem
 * - Endpoint: PATCH /api/notificaciones/:id/leida
 *
 * Backend relacionado: notificacionService.marcarLeida
 */
export const marcarNotificacionLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actualizado = await notificacionService.marcarLeida(
      id,
      req.usuario.id,
    );

    if (!actualizado) {
      return notFound(res, "Notificación no encontrada");
    }

    return ok(res, { message: "Notificación marcada como leída" });
  } catch (error) {
    next(error);
  }
};

/**
 * MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Botón "Marcar todas como leídas"
 * - Componente: MarcarTodasLeidasButton
 * - Endpoint: PATCH /api/notificaciones/marcar-todas-leidas
 *
 * Backend relacionado: notificacionService.marcarTodasLeidas
 */
export const marcarTodasLeidas = async (req, res, next) => {
  try {
    const total = await notificacionService.marcarTodasLeidas(req.usuario.id);

    return ok(res, {
      message: `${total} notificaciones marcadas como leídas`,
      total,
    });
  } catch (error) {
    next(error);
  }
};
