// backend/src/middlewares/configMiddleware.js
import { configRepository } from "../repositories/configRepository.js";

const CONFIG_DEFAULTS = {
  horario_apertura: { valor: "09:00", tipo: "texto" },
  horario_cierre: { valor: "20:00", tipo: "texto" },
  dias_laborales: {
    valor: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],
    tipo: "json",
  },
  duracion_slot: { valor: 30, tipo: "numero" },
  permitir_cancelacion: { valor: true, tipo: "booleano" },
};

/**
 * Middleware que carga la configuración del sistema y la añade a req.config
 */
export const cargarConfiguracion = async (req, res, next) => {
  try {
    if (req.app.get("config")) {
      req.config = req.app.get("config");
      return next();
    }

    let config = CONFIG_DEFAULTS;

    try {
      config = await configRepository.getAll();
    } catch (modelError) {
      console.warn(
        "[configMiddleware] BD no disponible, usando defaults:",
        modelError.message,
      );
    }

    req.app.set("config", config);
    req.config = config;
    next();
  } catch (error) {
    console.error("[configMiddleware] Error crítico:", error);
    req.config = CONFIG_DEFAULTS;
    next();
  }
};

/**
 * Invalida el caché de configuración
 */
export const invalidarCacheConfig = (app) => {
  app.set("config", null);
};

/**
 * Obtiene el valor de una clave de configuración desde req.config
 */
export const getConfigValue = (req, key) => req.config?.[key]?.valor ?? null;

/**
 * Obtiene un valor numérico de configuración
 */
export const getConfigNumber = (req, key, defaultValue = 0) => {
  const val = getConfigValue(req, key);
  return typeof val === "number" ? val : Number(val) || defaultValue;
};

export default {
  cargarConfiguracion,
  invalidarCacheConfig,
  getConfigValue,
  getConfigNumber,
};
