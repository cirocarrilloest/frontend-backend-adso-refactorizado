// backend/src/controllers/contactoController/publicoService.js
import { contactoRepository } from "../../repositories/contactoRepository.js";
import { notificacionService } from "../../services/notificacionService.js";
import { created } from "../../utils/responseUtils.js";
import { validarCamposContacto } from "./helpers.js";

/**
 * ENVIAR MENSAJE DE CONTACTO (público)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Formulario de contacto (página pública)
 * - Componente: ContactoForm
 * - Endpoint: POST /api/contacto
 * - Body: { name, email, message }
 *
 * Backend relacionado:
 * - contactoRepository.crear
 * - contactoRepository.getAdminIds (para notificar)
 * - notificacionService.crear (a todos los admins)
 */
export const enviarMensajeContacto = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Validar campos
    validarCamposContacto({ name, email, message });

    // Crear mensaje
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
