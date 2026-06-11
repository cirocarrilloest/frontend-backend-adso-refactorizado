// backend/src/middlewares/configMiddleware.js
/**
 * configMiddleware.js
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: mezclaba 3 responsabilidades en un archivo:
 *   1. Cargar y cachear configuración del sistema
 *   2. Validar que una hora está en horario laboral
 *   3. Validar que una fecha es día laborable
 * - Solución: separar en secciones claramente delimitadas con exports individuales
 *   para que cada middleware pueda usarse de forma independiente
 * - La lógica de helpers (getConfigValue, getConfigNumber) también está disponible
 *   para usarse en controllers sin necesidad de importar todo el archivo
 *
 * Principio aplicado: SRP — cada función exported tiene una sola razón para cambiar
 */

import { getPool } from "../config/db.js";
import { configRepository } from "../repositories/configRepository.js";

// ─── 1. CARGA Y CACHÉ DE CONFIGURACIÓN ──────────────────────────────────────

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
 * Middleware que carga la configuración del sistema y la añade a req.config.
 * Usa caché a nivel de aplicación para evitar una query por request.
 *
 * Responsabilidad única: cargar configuración y ponerla disponible en req.config.
 */
export const cargarConfiguracion = async (req, res, next) => {
  try {
    // Caché en memoria de la app — evita query por cada request
    if (req.app.get("config")) {
      req.config = req.app.get("config");
      return next();
    }

    let config = CONFIG_DEFAULTS;

    try {
      config = await configRepository.getAll();
    } catch (modelError) {
      // Fallback a defaults si la BD no responde — no bloquear la app
      console.warn(
        "[configMiddleware] BD no disponible, usando defaults:",
        modelError.message,
      );
    }

    req.app.set("config", config);
    req.config = config;
    next();
  } catch (error) {
    console.error(
      "[configMiddleware] Error crítico cargando configuración:",
      error,
    );
    req.config = CONFIG_DEFAULTS;
    next();
  }
};

/**
 * Invalida el caché de configuración almacenado en la app.
 * Llamar esto después de actualizar configuración en BD.
 */
export const invalidarCacheConfig = (app) => {
  app.set("config", null);
};

// ─── 2. HELPERS DE ACCESO A CONFIGURACIÓN ───────────────────────────────────

/**
 * Obtiene el valor de una clave de configuración desde req.config.
 * Retorna null si no existe.
 */
export const getConfigValue = (req, key) => req.config?.[key]?.valor ?? null;

/**
 * Obtiene un valor numérico de configuración con fallback.
 */
export const getConfigNumber = (req, key, defaultValue = 0) => {
  const val = getConfigValue(req, key);
  return typeof val === "number" ? val : Number(val) || defaultValue;
};

// ─── 3. VALIDACIÓN DE HORARIO LABORAL GENERAL ───────────────────────────────

/**
 * Middleware que valida si una hora (en req.body.hora) está dentro del
 * horario laboral general configurado en el sistema.
 *
 * Responsabilidad única: validar horario — no carga ni parsea configuración.
 * Requiere que cargarConfiguracion haya corrido antes.
 */
export const validarHorarioGeneral = (req, res, next) => {
  const { fecha, hora } = req.body;
  if (!fecha || !hora) return next();

  const apertura = getConfigValue(req, "horario_apertura") || "09:00";
  const cierre = getConfigValue(req, "horario_cierre") || "20:00";
  const horaStr = hora.substring(0, 5);

  if (horaStr < apertura || horaStr >= cierre) {
    return res.status(400).json({
      ok: false,
      message: `Horario general: ${apertura} - ${cierre}. La hora ${horaStr} está fuera de este rango.`,
    });
  }

  next();
};

// ─── 4. VALIDACIÓN DE DÍA LABORABLE ─────────────────────────────────────────

const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];
const DIAS_LABORALES_DEFAULT = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

/**
 * Middleware que valida si una fecha (en req.body.fecha) es un día laborable
 * según la configuración del sistema.
 *
 * Responsabilidad única: validar día — no valida hora ni carga config.
 * Requiere que cargarConfiguracion haya corrido antes.
 */
export const validarDiaLaborableGeneral = (req, res, next) => {
  const { fecha } = req.body;
  if (!fecha) return next();

  const diasLaborales =
    getConfigValue(req, "dias_laborales") || DIAS_LABORALES_DEFAULT;

  const fechaObj = new Date(fecha);
  const diaSemana = DIAS_SEMANA[fechaObj.getDay()];

  if (!diasLaborales.includes(diaSemana)) {
    return res.status(400).json({
      ok: false,
      message: `El negocio no labora los ${diaSemana}. Días laborales: ${diasLaborales.join(", ")}`,
    });
  }

  next();
};

export default {
  cargarConfiguracion,
  invalidarCacheConfig,
  getConfigValue,
  getConfigNumber,
  validarHorarioGeneral,
  validarDiaLaborableGeneral,
};
