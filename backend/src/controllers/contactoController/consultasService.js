// backend/src/controllers/contactoController/consultasService.js
import { contactoRepository } from "../../repositories/contactoRepository.js";
import { ok, notFound } from "../../utils/responseUtils.js";
import { NotFoundError } from "../../utils/errors.js";

/**
 * OBTENER TODOS LOS MENSAJES DE CONTACTO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Tabla de mensajes
 * - Componente: MensajesTable
 * - Endpoint: GET /api/contacto?soloNoLeidos=false&soloNoRespondidos=false&search=&page=1&limit=20
 * - Query params: soloNoLeidos, soloNoRespondidos, search, page, limit
 *
 * Backend relacionado: contactoRepository.getAll
 */
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

/**
 * OBTENER MENSAJE POR ID (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Detalle de mensaje
 * - Componente: MensajeDetalleModal
 * - Endpoint: GET /api/contacto/:id
 *
 * Backend relacionado: contactoRepository.getById
 */
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
