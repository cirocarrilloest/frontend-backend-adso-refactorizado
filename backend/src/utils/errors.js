// src/utils/errors.js
/**
 * Sistema centralizado de errores para la aplicación.
 * Permite lanzar errores con código HTTP desde cualquier capa.
 */

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos inválidos") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso denegado") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con el estado actual") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class BusinessRuleError extends AppError {
  constructor(message = "Violación de regla de negocio") {
    super(message, 422);
    this.name = "BusinessRuleError";
  }
}
