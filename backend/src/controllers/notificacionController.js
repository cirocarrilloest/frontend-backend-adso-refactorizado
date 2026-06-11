// backend/src/controllers/notificacionController.js

/**
 * notificacionController.js
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: el patrón res.status(500).json({ ok:false, message:"Error interno" })
 *   aparecía 4 veces en 40 líneas de código — responseUtils.js existía pero no se usaba
 * - Solución: usar responseUtils de manera consistente en todo el archivo
 *
 * Principio aplicado: DRY — eliminar boilerplate repetitivo
 */

import * as notificacionModel from "../models/notificacionModel.js";
import { ok, notFound, serverError } from "../utils/responseUtils.js";

/**
 * GET /api/notificaciones
 * Obtiene las notificaciones del usuario autenticado.
 */
export const getMisNotificaciones = async (req, res) => {
  try {
    const { soloNoLeidas = "false", limite = 20 } = req.query;
    const notificaciones = await notificacionModel.getNotificacionesByUsuario(
      req.usuario.id,
      soloNoLeidas === "true",
      parseInt(limite, 10),
    );
    return ok(res, { notificaciones });
  } catch (error) {
    return serverError(res, "getMisNotificaciones", error);
  }
};

/**
 * PATCH /api/notificaciones/:id/leer
 * Marca una notificación específica como leída.
 */
export const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await notificacionModel.marcarComoLeida(
      id,
      req.usuario.id,
    );

    if (!actualizado) {
      return notFound(res, "Notificación no encontrada");
    }

    return ok(res, { message: "Notificación marcada como leída" });
  } catch (error) {
    return serverError(res, "marcarNotificacionLeida", error);
  }
};

/**
 * PATCH /api/notificaciones/leer-todas
 * Marca todas las notificaciones del usuario como leídas.
 */
export const marcarTodasLeidas = async (req, res) => {
  try {
    const total = await notificacionModel.marcarTodasComoLeidas(req.usuario.id);
    return ok(res, { message: `${total} notificaciones marcadas como leídas` });
  } catch (error) {
    return serverError(res, "marcarTodasLeidas", error);
  }
};

/**
 * GET /api/notificaciones/contar-no-leidas
 * Retorna el conteo de notificaciones no leídas del usuario.
 */
export const contarNoLeidas = async (req, res) => {
  try {
    const total = await notificacionModel.contarNoLeidas(req.usuario.id);
    return ok(res, { total });
  } catch (error) {
    return serverError(res, "contarNoLeidas", error);
  }
};
