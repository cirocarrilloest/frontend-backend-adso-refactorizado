// backend/src/controllers/servicioController/activoService.js
import { servicioRepository } from "../../repositories/servicioRepository.js";
import { ok } from "../../utils/responseUtils.js";
import { validarServicioExistente } from "./helpers.js";

/**
 * CAMBIAR ESTADO ACTIVO/INACTIVO DE UN SERVICIO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Switch activo/inactivo
 * - Componente: ActivarServicioSwitch
 * - Endpoint: PATCH /api/servicios/:id/toggle-activo
 *
 * Backend relacionado:
 * - validarServicioExistente
 * - servicioRepository.update
 */
export const toggleActivoServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el servicio existe
    const servicio = await validarServicioExistente(id);

    const servicioActualizado = await servicioRepository.update(id, {
      activo: !servicio.activo,
    });

    return ok(res, {
      message: `Servicio ${servicioActualizado.activo ? "activado" : "desactivado"} exitosamente`,
      servicio: servicioActualizado,
    });
  } catch (error) {
    next(error);
  }
};
