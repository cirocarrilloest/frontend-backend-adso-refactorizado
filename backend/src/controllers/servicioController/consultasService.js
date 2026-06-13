// backend/src/controllers/servicioController/consultasService.js
import { servicioRepository } from "../../repositories/servicioRepository.js";
import { ok } from "../../utils/responseUtils.js";
import { validarServicioExistente } from "./helpers.js";

/**
 * OBTENER LISTA DE SERVICIOS (público + admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend:
 * - Cliente: Selector de servicio al agendar cita
 * - Admin: Tabla de servicios
 * - Endpoint: GET /api/servicios?activos=true
 * - Query params: activos (boolean) - solo servicios activos
 *
 * Backend relacionado: servicioRepository.findAll
 */
export const getServicios = async (req, res, next) => {
  try {
    const soloActivos = req.query.activos === "true";
    const servicios = await servicioRepository.findAll(soloActivos);
    return ok(res, { servicios });
  } catch (error) {
    next(error);
  }
};

/**
 * OBTENER SERVICIO POR ID (público + admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Detalle de servicio (Admin)
 * - Componente: ServicioDetalleModal
 * - Endpoint: GET /api/servicios/:id
 *
 * Backend relacionado:
 * - validarServicioExistente
 * - servicioRepository.findById
 */
export const getServicioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicio = await validarServicioExistente(id);
    return ok(res, { servicio });
  } catch (error) {
    next(error);
  }
};
