// backend/src/controllers/configController/consultasService.js
import { configRepository } from "../../repositories/configRepository.js";
import { ok, notFound } from "../../utils/responseUtils.js";

/**
 * OBTENER TODA LA CONFIGURACIÓN (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel de configuración (Admin)
 * - Componente: ConfiguracionPanel
 * - Endpoint: GET /api/configuracion
 *
 * Backend relacionado: configRepository.getAll
 */
export const getConfiguracion = async (req, res, next) => {
  try {
    const config = await configRepository.getAll();
    return ok(res, { configuracion: config });
  } catch (error) {
    next(error);
  }
};

/**
 * OBTENER CONFIGURACIÓN POR CLAVE (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Obtener valor de configuración específica (Admin)
 * - Componente: ConfiguracionItem
 * - Endpoint: GET /api/configuracion/:key
 *
 * Backend relacionado: configRepository.getByKey
 */
export const getConfigByKeyController = async (req, res, next) => {
  try {
    const { key } = req.params;
    const config = await configRepository.getByKey(key);

    if (!config) {
      return notFound(res, "Clave de configuración no encontrada");
    }

    return ok(res, { configuracion: config });
  } catch (error) {
    next(error);
  }
};
