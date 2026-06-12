// backend/src/controllers/notificacionController.js
import { notificacionService } from "../services/notificacionService.js";
import { ok, notFound } from "../utils/responseUtils.js";

export const getMisNotificaciones = async (req, res, next) => {
  try {
    const { soloNoLeidas = "false", limite = 20 } = req.query;
    const notificaciones = await notificacionService.getByUsuario(
      req.usuario.id,
      soloNoLeidas === "true",
      parseInt(limite, 10),
    );
    return ok(res, { notificaciones });
  } catch (error) {
    next(error);
  }
};

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

export const marcarTodasLeidas = async (req, res, next) => {
  try {
    const total = await notificacionService.marcarTodasLeidas(req.usuario.id);
    return ok(res, { message: `${total} notificaciones marcadas como leídas` });
  } catch (error) {
    next(error);
  }
};

export const contarNoLeidas = async (req, res, next) => {
  try {
    const total = await notificacionService.contarNoLeidas(req.usuario.id);
    return ok(res, { total });
  } catch (error) {
    next(error);
  }
};

export default {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  contarNoLeidas,
};
