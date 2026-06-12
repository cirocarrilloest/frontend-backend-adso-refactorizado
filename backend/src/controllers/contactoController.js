// backend/src/controllers/contactoController.js
import { contactoRepository } from "../repositories/contactoRepository.js";
import { notificacionService } from "../services/notificacionService.js";
import { ok, badRequest } from "../utils/responseUtils.js";
import { ValidationError } from "../utils/errors.js";

export const enviarMensajeContacto = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new ValidationError("Nombre, email y mensaje son requeridos");
    }

    const mensajeId = await contactoRepository.crear({
      nombre: name,
      email,
      mensaje: message,
    });

    // Notificar a todos los admins
    const adminIds = await contactoRepository.getAdminIds();
    await Promise.all(
      adminIds.map((adminId) =>
        notificacionService.crear({
          usuarioId: adminId,
          tipo: "contacto",
          titulo: "Nuevo mensaje de contacto",
          mensaje: `${name} (${email}) ha enviado un mensaje`,
          data: { mensajeId, nombre: name, email },
        }),
      ),
    );

    return ok(res, { message: "Mensaje enviado exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const getMensajesContacto = async (req, res, next) => {
  try {
    const { soloNoLeidos = "false", limite = 50 } = req.query;

    const mensajes = await contactoRepository.getAll({
      soloNoLeidos: soloNoLeidos === "true",
      limite,
    });

    return ok(res, { mensajes });
  } catch (error) {
    next(error);
  }
};

export const marcarMensajeLeido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actualizado = await contactoRepository.marcarLeido(id);

    if (!actualizado) {
      return notFound(res, "Mensaje no encontrado");
    }

    return ok(res, { message: "Mensaje marcado como leído" });
  } catch (error) {
    next(error);
  }
};

export default {
  enviarMensajeContacto,
  getMensajesContacto,
  marcarMensajeLeido,
};
