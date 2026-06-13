// backend/src/controllers/contactoController/eliminacionService.js
import { contactoRepository } from "../../repositories/contactoRepository.js";
import { ok, badRequest, notFound } from "../../utils/responseUtils.js";
import { validarIdsArray } from "./helpers.js";

/**
 * ELIMINAR MENSAJE INDIVIDUAL (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Botón eliminar mensaje
 * - Componente: EliminarMensajeButton
 * - Endpoint: DELETE /api/contacto/:id
 *
 * Backend relacionado: contactoRepository.eliminar
 */
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

/**
 * ELIMINAR MÚLTIPLES MENSAJES (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Selección múltiple
 * - Componente: SeleccionarMensajes, EliminarSeleccionadosButton
 * - Endpoint: DELETE /api/contacto/eliminar-multiples
 * - Body: { ids: [1, 2, 3] }
 *
 * Backend relacionado: contactoRepository.eliminarMultiples
 */
export const eliminarMensajesMultiples = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Validar array de IDs
    validarIdsArray(ids);

    const eliminados = await contactoRepository.eliminarMultiples(ids);

    return ok(res, {
      message: `${eliminados} mensaje(s) eliminado(s) exitosamente`,
      total: eliminados,
    });
  } catch (error) {
    next(error);
  }
};
