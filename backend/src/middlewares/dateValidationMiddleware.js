// backend/src/middlewares/dateValidationMiddleware.js
import { getPool } from "../config/db.js";
import {
  validarFechaHoraFutura,
  normalizarFecha,
  getDiaSemana,
  fechaHoyStr,
  horaActualStr,
} from "../utils/dateUtils.js";
import { ValidationError } from "../utils/errors.js";

/**
 * Valida que la fecha no sea pasada
 */
export const validarFechaNoPasada = (
  fieldName = "fecha",
  isQuery = false,
  horaField = "hora",
) => {
  return async (req, res, next) => {
    const fechaStr = isQuery ? req.query[fieldName] : req.body[fieldName];
    if (!fechaStr) return next();

    const fechaNorm = normalizarFecha(fechaStr);
    const horaStr = isQuery ? req.query[horaField] : req.body[horaField];

    const error = validarFechaHoraFutura(fechaNorm, horaStr);
    if (error) {
      throw new ValidationError(error.message);
    }
    next();
  };
};

/**
 * Valida que la hora esté dentro del rango laboral del barbero específico
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
      throw new ValidationError(
        `El barbero no tiene horario configurado para los ${diaSemana}`,
      );
    }

    const horaStr = String(hora).slice(0, 5);
    const inicio = String(rows[0].hora_inicio).slice(0, 5);
    const fin = String(rows[0].hora_fin).slice(0, 5);

    if (horaStr < inicio || horaStr >= fin) {
      throw new ValidationError(
        `La hora seleccionada (${horaStr}) está fuera del horario del barbero. Horario disponible: ${inicio} - ${fin}`,
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validarFechaNoPasada,
  validarHoraLaboral,
};
