// backend/src/controllers/configController/actualizacionService.js
import { configRepository } from "../../repositories/configRepository.js";
import { ok, notFound } from "../../utils/responseUtils.js";
import { invalidarCacheConfig } from "../../middlewares/configMiddleware.js";
import {
  validarCampoValor,
  validarConfiguracionesMultiples,
  validarConfigExists,
} from "./helpers.js";

/**
 * ACTUALIZAR CONFIGURACIÓN POR CLAVE (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Editar configuración individual
 * - Componente: ConfiguracionEditForm
 * - Endpoint: PUT /api/configuracion/:key
 * - Body: { valor }
 *
 * Backend relacionado:
 * - validarCampoValor
 * - validarConfigExists
 * - configRepository.set
 * - invalidarCacheConfig
 */
export const updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { valor } = req.body;

    // Validar campo valor
    validarCampoValor(valor, res);

    // Verificar que la clave existe
    await validarConfigExists(key, res);

    const configActualizada = await configRepository.set(key, valor);

    // Invalidar caché
    invalidarCacheConfig(req.app);

    return ok(res, {
      message: "Configuración actualizada exitosamente",
      configuracion: configActualizada,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ACTUALIZAR MÚLTIPLES CONFIGURACIONES (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Guardar múltiples cambios de configuración
 * - Componente: ConfiguracionMultiEditForm
 * - Endpoint: PUT /api/configuracion/multiple
 * - Body: { configuraciones: { clave1: valor1, clave2: valor2 } }
 *
 * Backend relacionado:
 * - validarConfiguracionesMultiples
 * - configRepository.setMany
 * - invalidarCacheConfig
 */
export const updateMultipleConfig = async (req, res, next) => {
  try {
    const { configuraciones } = req.body;

    // Validar configuraciones múltiples
    validarConfiguracionesMultiples(configuraciones, res);

    const configActualizada = await configRepository.setMany(configuraciones);

    // Invalidar caché
    invalidarCacheConfig(req.app);

    return ok(res, {
      message: "Configuraciones actualizadas exitosamente",
      configuracion: configActualizada,
    });
  } catch (error) {
    next(error);
  }
};
