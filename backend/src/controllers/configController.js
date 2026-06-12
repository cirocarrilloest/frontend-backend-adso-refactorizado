// backend/src/controllers/configController.js
import { configRepository } from "../repositories/configRepository.js";
import { ok, notFound, badRequest } from "../utils/responseUtils.js";
import { invalidarCacheConfig } from "../middlewares/configMiddleware.js";

export const getConfiguracion = async (req, res, next) => {
  try {
    const config = await configRepository.getAll();
    return ok(res, { configuracion: config });
  } catch (error) {
    next(error);
  }
};

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

export const updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { valor } = req.body;

    if (valor === undefined) {
      return badRequest(res, 'Se requiere el campo "valor"');
    }

    const configActualizada = await configRepository.set(key, valor);

    if (!configActualizada) {
      return notFound(res, "Clave de configuración no encontrada");
    }

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

export const updateMultipleConfig = async (req, res, next) => {
  try {
    const { configuraciones } = req.body;

    if (!configuraciones || typeof configuraciones !== "object") {
      return badRequest(
        res,
        'Se requiere un objeto "configuraciones" con las claves y valores a actualizar',
      );
    }

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

export default {
  getConfiguracion,
  getConfigByKeyController,
  updateConfig,
  updateMultipleConfig,
};
