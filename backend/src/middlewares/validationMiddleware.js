// src/middlewares/validationMiddleware.js
import joi from "joi";

// Validación para crear/agendar cita
export const validarCita = (req, res, next) => {
  const schema = joi.object({
    barbero_id: joi.number().integer().positive().required(),
    servicio_id: joi.number().integer().positive().required(),
    fecha: joi.date().iso().required(),
    hora: joi
      .string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    notas: joi.string().max(500).optional().allow(""),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ ok: false, message: error.details[0].message });
  }
  next();
};

// Validación para crear servicio
export const validarServicio = (req, res, next) => {
  const schema = joi.object({
    nombre: joi.string().min(3).max(100).required(),
    descripcion: joi.string().max(500).optional().allow(""),
    duracion: joi.number().integer().min(5).max(240).required(),
    precio: joi.number().positive().required(),
    activo: joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ ok: false, message: error.details[0].message });
  }
  next();
};

// Validación para actualizar servicio (campos opcionales)
export const validarActualizarServicio = (req, res, next) => {
  const schema = joi.object({
    nombre: joi.string().min(3).max(100).optional(),
    descripcion: joi.string().max(500).optional().allow(""),
    duracion: joi.number().integer().min(5).max(240).optional(),
    precio: joi.number().positive().optional(),
    activo: joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ ok: false, message: error.details[0].message });
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      ok: false,
      message: "Debes proporcionar al menos un campo para actualizar",
    });
  }
  next();
};

// Validación de ID en parámetros
export const validarId = (req, res, next) => {
  const { error } = joi
    .object({
      id: joi.number().integer().positive().required(),
    })
    .validate(req.params);

  if (error) {
    return res.status(400).json({ ok: false, message: "ID inválido" });
  }
  next();
};

// Validación para configurar horario de barbero
export const validarHorario = (req, res, next) => {
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

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ ok: false, message: error.details[0].message });
  }
  next();
};

// Validación para crear cita como administrador
export const validarCitaAdmin = (req, res, next) => {
  const schema = joi.object({
    cliente_id: joi.number().integer().positive().required(),
    barbero_id: joi.number().integer().positive().required(),
    servicio_id: joi.number().integer().positive().required(),
    fecha: joi.date().iso().required(),
    hora: joi
      .string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    notas: joi.string().max(500).optional().allow("", null),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ ok: false, message: error.details[0].message });
  }
  next();
};
