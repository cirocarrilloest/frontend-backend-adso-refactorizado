// backend/src/controllers/notificacionController.js
import * as notificacionModel from "../models/notificacionModel.js";

/** Obtener mis notificaciones */
export const getMisNotificaciones = async (req, res) => {
  try {
    const { soloNoLeidas = "false", limite = 20 } = req.query;
    const notificaciones = await notificacionModel.getNotificacionesByUsuario(
      req.usuario.id,
      soloNoLeidas === "true",
      parseInt(limite),
    );
    res.json({ ok: true, notificaciones });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** Marcar notificación como leída */
export const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await notificacionModel.marcarComoLeida(
      id,
      req.usuario.id,
    );
    if (!resultado) {
      return res
        .status(404)
        .json({ ok: false, message: "Notificación no encontrada" });
    }
    res.json({ ok: true, message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** Marcar todas como leídas */
export const marcarTodasLeidas = async (req, res) => {
  try {
    const total = await notificacionModel.marcarTodasComoLeidas(req.usuario.id);
    res.json({
      ok: true,
      message: `${total} notificaciones marcadas como leídas`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/** Contar no leídas */
export const contarNoLeidas = async (req, res) => {
  try {
    const total = await notificacionModel.contarNoLeidas(req.usuario.id);
    res.json({ ok: true, total });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};
