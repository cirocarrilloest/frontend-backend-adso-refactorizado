// backend/src/controllers/contactoController.js
import { contactoRepository } from "../repositories/contactoRepository.js";
import { notificacionService } from "../services/notificacionService.js";
import { ok, created, badRequest, notFound } from "../utils/responseUtils.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

export const enviarMensajeContacto = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new ValidationError("Nombre, email y mensaje son requeridos");
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("El email no es válido");
    }

    const mensajeId = await contactoRepository.crear({
      nombre: name,
      email,
      mensaje: message,
    });

    // Notificar a todos los admins
    const adminIds = await contactoRepository.getAdminIds();
    if (adminIds.length > 0) {
      await Promise.all(
        adminIds.map((adminId) =>
          notificacionService.crear({
            usuarioId: adminId,
            tipo: "contacto",
            titulo: "📬 Nuevo mensaje de contacto",
            mensaje: `${name} (${email}) ha enviado un mensaje`,
            data: { mensajeId, nombre: name, email },
          }),
        ),
      );
    }

    return created(res, {
      message: "Mensaje enviado exitosamente. Te responderemos pronto.",
      mensajeId,
    });
  } catch (error) {
    next(error);
  }
};

export const getMensajesContacto = async (req, res, next) => {
  try {
    const {
      soloNoLeidos = "false",
      soloNoRespondidos = "false",
      search = "",
      page = 1,
      limit = 20,
    } = req.query;

    const result = await contactoRepository.getAll({
      soloNoLeidos: soloNoLeidos === "true",
      soloNoRespondidos: soloNoRespondidos === "true",
      search: search || "",
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return ok(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMensajeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensaje = await contactoRepository.getById(id);

    if (!mensaje) {
      return notFound(res, "Mensaje no encontrado");
    }

    return ok(res, { mensaje });
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

export const marcarMensajeRespondido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    if (!respuesta) {
      return badRequest(res, "Se requiere la respuesta");
    }

    const mensaje = await contactoRepository.getById(id);
    if (!mensaje) {
      return notFound(res, "Mensaje no encontrado");
    }

    const actualizado = await contactoRepository.marcarRespondido(
      id,
      respuesta,
    );

    if (!actualizado) {
      return notFound(res, "No se pudo marcar como respondido");
    }

    // Notificar al usuario que su mensaje fue respondido
    // Aquí se podría integrar un servicio de email (nodemailer)

    return ok(res, {
      message: "Mensaje marcado como respondido",
      respuesta,
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarMensaje = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eliminado = await contactoRepository.eliminar(id);

    if (!eliminado) {
      return notFound(res, "Mensaje no encontrado");
    }

    return ok(res, { message: "Mensaje eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const eliminarMensajesMultiples = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "Se requiere un array de IDs");
    }

    const eliminados = await contactoRepository.eliminarMultiples(ids);

    return ok(res, {
      message: `${eliminados} mensaje(s) eliminado(s) exitosamente`,
      total: eliminados,
    });
  } catch (error) {
    next(error);
  }
};

export const getEstadisticasContacto = async (req, res, next) => {
  try {
    const estadisticas = await contactoRepository.getEstadisticas();
    return ok(res, { estadisticas });
  } catch (error) {
    next(error);
  }
};

export default {
  enviarMensajeContacto,
  getMensajesContacto,
  getMensajeById,
  marcarMensajeLeido,
  marcarMensajeRespondido,
  eliminarMensaje,
  eliminarMensajesMultiples,
  getEstadisticasContacto,
};
