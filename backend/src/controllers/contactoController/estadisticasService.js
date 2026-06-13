// backend/src/controllers/contactoController/estadisticasService.js
import { contactoRepository } from "../../repositories/contactoRepository.js";
import { ok } from "../../utils/responseUtils.js";

/**
 * OBTENER ESTADÍSTICAS DE MENSAJES (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Dashboard Admin - Tarjetas de mensajes
 * - Componente: MensajesStatsCards
 * - Endpoint: GET /api/contacto/estadisticas
 *
 * Backend relacionado: contactoRepository.getEstadisticas
 */
export const getEstadisticasContacto = async (req, res, next) => {
  try {
    const estadisticas = await contactoRepository.getEstadisticas();
    return ok(res, { estadisticas });
  } catch (error) {
    next(error);
  }
};
