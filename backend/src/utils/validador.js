// backend/src/utils/validador.js
import joi from "joi";

/**
 * Validación para registro de usuario
 */
export const validarRegistro = (data) => {
  const schema = joi.object({
    nombre: joi.string().min(2).max(100).required(),
    email: joi.string().email().required(),
    pass: joi.string().min(6).required(),
    telefono: joi
      .string()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(7)
      .max(20)
      .optional()
      .allow("", null),
  });
  return schema.validate(data, { abortEarly: false });
};

/**
 * Validación para ingreso de usuario
 */
export const validarIngreso = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    pass: joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
};

/**
 * Validación para crear/agendar cita
 */
export const validarCita = (data) => {
  const schema = joi.object({
    barbero_id: joi.number().integer().positive().required(),
    servicio_id: joi.number().integer().positive().required(),
    fecha: joi.date().iso().required(),
    hora: joi
      .string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    notas: joi.string().max(500).optional().allow("", null),
  });
  return schema.validate(data, { abortEarly: false });
};

/**
 * Validación para crear servicio
 */
export const validarServicio = (data) => {
  const schema = joi.object({
    nombre: joi.string().min(3).max(100).required(),
    descripcion: joi.string().max(500).optional().allow("", null),
    duracion: joi.number().integer().min(5).max(240).required(),
    precio: joi.number().positive().required(),
    activo: joi.boolean().optional(),
  });
  return schema.validate(data, { abortEarly: false });
};

/**
 * Validación para ID en parámetros
 */
export const validarId = (id) => {
  const schema = joi.object({
    id: joi.number().integer().positive().required(),
  });
  return schema.validate({ id }, { abortEarly: false });
};

/**
 * Validación para horario de barbero
 */
export const validarHorario = (data) => {
  const diasValidos = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const schema = joi.object({
    dia_semana: joi
      .string()
      .valid(...diasValidos)
      .required(),
    hora_inicio: joi
      .string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    hora_fin: joi
      .string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
  });
  return schema.validate(data, { abortEarly: false });
};

export default {
  validarRegistro,
  validarIngreso,
  validarCita,
  validarServicio,
  validarId,
  validarHorario,
};
