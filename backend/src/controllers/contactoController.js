// backend/src/controllers/contactoController.js

/**
 * contactoController.js
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: llamaba getPool() directamente (acceso a datos en controller)
 * - Problema anterior: no usaba responseUtils — duplicaba el patrón de error
 * - Problema anterior: el loop de notificaciones a admins mezclaba responsabilidades
 * - Solución: delegar SQL al repositorio, usar responseUtils, mantener controller
 *   únicamente como capa HTTP (validar entrada → llamar repo/servicio → responder)
 *
 * Principio aplicado: SRP + Dependency Inversion
 */

import { contactoRepository } from "../repositories/contactoRepository.js";
import { crearNotificacion } from "../models/notificacionModel.js";
import {
  ok,
  badRequest,
  notFound,
  serverError,
} from "../utils/responseUtils.js";

/**
 * POST /api/contacto
 * Público — cualquier visitante puede enviar un mensaje.
 */
export const enviarMensajeContacto = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return badRequest(res, "Nombre, email y mensaje son requeridos");
    }

    const mensajeId = await contactoRepository.crear({
      nombre: name,
      email,
      mensaje: message,
    });

    // Notificar a todos los admins — responsabilidad de servicio de notificaciones
    const adminIds = await contactoRepository.getAdminIds();
    await Promise.all(
      adminIds.map((adminId) =>
        crearNotificacion(
          adminId,
          "contacto",
          "Nuevo mensaje de contacto",
          `${name} (${email}) ha enviado un mensaje`,
          { mensajeId, nombre: name, email },
        ),
      ),
    );

    return ok(res, { message: "Mensaje enviado exitosamente" });
  } catch (error) {
    return serverError(res, "enviarMensajeContacto", error);
  }
};

/**
 * GET /api/contacto/mensajes
 * Solo admin — lista mensajes con filtro opcional de no leídos.
 */
export const getMensajesContacto = async (req, res) => {
  try {
    const { soloNoLeidos = "false", limite = 50 } = req.query;

    const mensajes = await contactoRepository.getAll({
      soloNoLeidos: soloNoLeidos === "true",
      limite,
    });

    return ok(res, { mensajes });
  } catch (error) {
    return serverError(res, "getMensajesContacto", error);
  }
};

/**
 * PATCH /api/contacto/mensajes/:id/leer
 * Solo admin — marca un mensaje como leído.
 */
export const marcarMensajeLeido = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await contactoRepository.marcarLeido(id);

    if (!actualizado) {
      return notFound(res, "Mensaje no encontrado");
    }

    return ok(res, { message: "Mensaje marcado como leído" });
  } catch (error) {
    return serverError(res, "marcarMensajeLeido", error);
  }
};
