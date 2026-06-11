// src/middlewares/dateValidationMiddleware.js
/**
 * Middlewares de validación de fechas y horarios.
 * La lógica de comparación de fechas fue movida a utils/dateUtils.js.
 * Este archivo solo contiene los middlewares de Express.
 */

import { getPool } from "../config/db.js";
import {
  validarFechaHoraFutura,
  normalizarFecha,
  getDiaSemana,
} from "../utils/dateUtils.js";

/**
 * Obtiene los días laborales desde la configuración del request.
 */
const getDiasLaborales = (req) => {
  const config = req.config || {};
  const dias = config.dias_laborales?.valor;
  if (Array.isArray(dias) && dias.length > 0) {
    return dias;
  }
  // Valor por defecto
  return ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
};

/**
 * Valida que el día sea laborable según configuración del sistema.
 */
export const validarDiaLaborable = (req, res, next) => {
  const { fecha, hora } = req.body;
  if (!fecha) return next();
  const diaSemana = getDiaSemana(fecha);
  const diasLaborales = getDiasLaborales(req);
  if (!diasLaborales.includes(diaSemana)) {
    return res.status(400).json({
      ok: false,
      message: `El negocio no labora los ${diaSemana}. Días laborales: ${diasLaborales.join(", ")}`,
    });
  }
  // Validar horario laboral global (si existe en configuración)
  if (hora) {
    const apertura = req.config?.horario_apertura?.valor || "09:00";
    const cierre = req.config?.horario_cierre?.valor || "20:00";
    const horaStr = String(hora).slice(0, 5);
    if (horaStr < apertura || horaStr >= cierre) {
      return res.status(400).json({
        ok: false,
        message: `Horario no disponible. El negocio está abierto de ${apertura} a ${cierre}`,
      });
    }
  }
  next();
};

/**
 * Valida que la fecha (y opcionalmente la hora) no sean pasadas.
 */
export const validarFechaNoPasada = (
  fieldName = "fecha",
  isQuery = false,
  horaField = "hora",
) => {
  return (req, res, next) => {
    const fechaStr = isQuery ? req.query[fieldName] : req.body[fieldName];
    if (!fechaStr) return next();

    const fechaNorm = normalizarFecha(fechaStr);
    const horaStr = isQuery ? req.query[horaField] : req.body[horaField];

    const error = validarFechaHoraFutura(fechaNorm, horaStr);
    if (error) {
      return res.status(400).json(error);
    }
    next();
  };
};

/**
 * Valida que la hora esté dentro del rango laboral del barbero específico.
 */
export const validarHoraLaboral = async (req, res, next) => {
  const { barbero_id, fecha, hora } = req.body;
  if (!barbero_id || !fecha || !hora) return next();

  try {
    const pool = getPool();
    const diaSemana = getDiaSemana(fecha);

    const [rows] = await pool.execute(
      `SELECT hora_inicio, hora_fin FROM horarios_barbero
       WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
      [barbero_id, diaSemana],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        ok: false,
        message: `El barbero no tiene horario configurado para los ${diaSemana}`,
      });
    }

    const horaStr = String(hora).slice(0, 5);
    const inicio = String(rows[0].hora_inicio).slice(0, 5);
    const fin = String(rows[0].hora_fin).slice(0, 5);

    if (horaStr < inicio || horaStr >= fin) {
      return res.status(400).json({
        ok: false,
        message: `La hora seleccionada (${horaStr}) está fuera del horario del barbero. Horario disponible: ${inicio} - ${fin}`,
      });
    }
    next();
  } catch (error) {
    console.error("Error validando hora laboral:", error);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/**
 * Valida que una cancelación tenga suficiente antelación según configuración.
 */
export const validarAntelacionCancelacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [citas] = await pool.execute(
      "SELECT fecha, hora FROM citas WHERE id = ?",
      [id],
    );

    if (citas.length === 0) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    const config = req.config || {};
    const permitir =
      config.permitir_cancelacion?.valor === true ||
      config.permitir_cancelacion?.valor === "true";
    const horasMin = parseInt(config.horas_min_cancelacion?.valor || 2);

    if (!permitir) {
      return res.status(400).json({
        ok: false,
        message:
          "El sistema no permite cancelar citas. Contacta al administrador.",
      });
    }

    const fechaCita = new Date(`${citas[0].fecha}T${citas[0].hora}`);
    const diffHoras = (fechaCita - new Date()) / (1000 * 60 * 60);

    if (diffHoras < horasMin) {
      return res.status(400).json({
        ok: false,
        message: `Para cancelar se requiere al menos ${horasMin} horas de antelación`,
      });
    }
    next();
  } catch (error) {
    console.error("Error validando antelación:", error);
    next();
  }
};
