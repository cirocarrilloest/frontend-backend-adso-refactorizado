// backend/src/middlewares/configMiddleware.js
/**
 * configMiddleware.js - Middleware para cargar configuración global
 */

import { getPool } from "../config/db.js";
import { getAllConfig } from "../models/configModel.js";

/**
 * Middleware que carga la configuración del sistema y la añade a req.config
 */
export const cargarConfiguracion = async (req, res, next) => {
  try {
    // Si ya está cargada en memoria de la app, usar caché
    if (req.app.get("config")) {
      req.config = req.app.get("config");
      return next();
    }

    // Intentar cargar desde el modelo primero (si existe)
    let config = {};

    try {
      // Usar getAllConfig del modelo si está disponible
      if (typeof getAllConfig === "function") {
        config = await getAllConfig();
      } else {
        // Fallback: consulta directa a la BD
        const pool = getPool();
        const [rows] = await pool.execute(
          "SELECT clave, valor, tipo FROM configuracion",
        );

        // Convertir a objeto con valores parseados según su tipo
        rows.forEach((row) => {
          let valor = row.valor;

          // Parsear según el tipo
          switch (row.tipo) {
            case "numero":
              valor = Number(valor);
              break;
            case "booleano":
              valor = valor === "true" || valor === true;
              break;
            case "json":
              try {
                valor = JSON.parse(valor);
              } catch (e) {
                console.error(`Error parsing JSON para ${row.clave}:`, e);
                valor = {};
              }
              break;
            case "texto":
            default:
              // Mantener como string
              break;
          }

          config[row.clave] = {
            valor,
            tipo: row.tipo,
          };
        });
      }
    } catch (modelError) {
      console.warn(
        "Error cargando desde modelo, usando fallback:",
        modelError.message,
      );
      // Fallback: valores por defecto si no hay BD
      config = {
        horario_apertura: { valor: "09:00", tipo: "texto" },
        horario_cierre: { valor: "20:00", tipo: "texto" },
        dias_laborales: {
          valor: [
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
          ],
          tipo: "json",
        },
        duracion_slot: { valor: 30, tipo: "numero" },
        permitir_cancelacion: { valor: true, tipo: "booleano" },
      };
    }

    // Guardar en memoria de la app (caché global)
    req.app.set("config", config);
    req.config = config;

    next();
  } catch (error) {
    console.error("Error cargando configuración:", error);
    // Config vacía con valores por defecto para no romper la app
    req.config = {
      horario_apertura: { valor: "09:00", tipo: "texto" },
      horario_cierre: { valor: "20:00", tipo: "texto" },
      dias_laborales: {
        valor: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],
        tipo: "json",
      },
      duracion_slot: { valor: 30, tipo: "numero" },
      permitir_cancelacion: { valor: true, tipo: "booleano" },
    };
    next();
  }
};

/**
 * Obtiene un valor de configuración por clave
 */
export const getConfigValue = (req, key) => {
  return req.config?.[key]?.valor ?? null;
};

/**
 * Obtiene un valor numérico de configuración
 */
export const getConfigNumber = (req, key, defaultValue = 0) => {
  const val = getConfigValue(req, key);
  return typeof val === "number" ? val : Number(val) || defaultValue;
};

/**
 * Valida si una fecha/hora está dentro del horario laboral general
 */
export const validarHorarioGeneral = async (req, res, next) => {
  const { fecha, hora } = req.body;

  if (!fecha || !hora) {
    return next();
  }

  const config = req.config;
  const apertura = config?.horario_apertura?.valor || "09:00";
  const cierre = config?.horario_cierre?.valor || "20:00";

  // Validar que la hora esté dentro del horario general
  const horaStr = hora.substring(0, 5);

  if (horaStr < apertura || horaStr >= cierre) {
    return res.status(400).json({
      ok: false,
      message: `Horario general: ${apertura} - ${cierre}. La hora ${horaStr} está fuera de este rango.`,
    });
  }

  next();
};

/**
 * Valida si una fecha es día laborable según configuración
 */
export const validarDiaLaborableGeneral = async (req, res, next) => {
  const { fecha } = req.body;

  if (!fecha) {
    return next();
  }

  const config = req.config;
  const diasLaborales = config?.dias_laborales?.valor || [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const fechaObj = new Date(fecha);
  const diaSemana = diasSemana[fechaObj.getDay()];

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
  getConfigValue,
  getConfigNumber,
  validarHorarioGeneral,
  validarDiaLaborableGeneral,
};
