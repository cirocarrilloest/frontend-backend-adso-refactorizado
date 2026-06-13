// backend/src/controllers/contactoController/estadoService.js
import { contactoRepository } from "../../repositories/contactoRepository.js";
import { ok, badRequest, notFound } from "../../utils/responseUtils.js";
import { validarRespuesta } from "./helpers.js";

/**
 * MARCAR MENSAJE COMO LEÍDO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Al abrir/ver mensaje
 * - Componente: MensajeDetalleModal (automático al abrir)
 * - Endpoint: PATCH /api/contacto/:id/leido
 *
 * Backend relacionado: contactoRepository.marcarLeido
 */
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

/**
 * MARCAR MENSAJE COMO RESPONDIDO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Botón responder mensaje
 * - Componente: ResponderMensajeModal
 * - Endpoint: PATCH /api/contacto/:id/respondido
 * - Body: { respuesta }
 *
 * Backend relacionado:
 * - contactoRepository.getById (verificar existencia)
 * - contactoRepository.marcarRespondido
 */
export const marcarMensajeRespondido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    // Validar respuesta
    validarRespuesta(respuesta);

    // Verificar que el mensaje existe
    const mensaje = await contactoRepository.getById(id);
    if (!mensaje) {
      return notFound(res, "Mensaje no encontrado");
    }

    // Marcar como respondido
    const actualizado = await contactoRepository.marcarRespondido(
      id,
      respuesta,
    );

    if (!actualizado) {
      return notFound(res, "No se pudo marcar como respondido");
    }

    // TODO: Enviar email al usuario (integrar nodemailer)
    // await emailService.enviarRespuesta(mensaje.email, respuesta);

    return ok(res, {
      message: "Mensaje marcado como respondido",
      respuesta,
    });
  } catch (error) {
    next(error);
  }
};
