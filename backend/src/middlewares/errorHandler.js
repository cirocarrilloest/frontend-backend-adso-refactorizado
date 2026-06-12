// src/middlewares/errorHandler.js
import { AppError } from "../utils/errors.js";
import chalk from "chalk";

/**
 * Middleware global de manejo de errores.
 * Captura cualquier error de la aplicación y responde consistentemente.
 */
export const errorHandler = (err, req, res, next) => {
  // Log detallado para debugging
  console.error(chalk.red("[ERROR]"), {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.usuario?.id,
  });

  // Error operacional lanzado por nosotros
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Error de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      ok: false,
      message: "Error de validación",
      details: err.details.map((d) => d.message),
    });
  }

  // Error de base de datos - duplicado
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      ok: false,
      message: "Registro duplicado. Ya existe un registro con ese valor único.",
    });
  }

  // Error de foreign key constraint
  if (
    err.code === "ER_ROW_IS_REFERENCED_2" ||
    err.code === "ER_NO_REFERENCED_ROW_2"
  ) {
    return res.status(400).json({
      ok: false,
      message:
        "No se puede realizar la operación porque hay registros relacionados.",
    });
  }

  // Error desconocido - respuesta genérica
  return res.status(500).json({
    ok: false,
    message: "Error interno del servidor",
  });
};
