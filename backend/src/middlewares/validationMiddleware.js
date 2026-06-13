// src/middlewares/validationMiddleware.js

/**
 * Middleware para validar datos de registro de usuario
 */
export const validarRegistroMiddleware = (req, res, next) => {
  const { nombre, email, password, telefono } = req.body;
  const errores = [];

  // Validar nombre
  if (!nombre || nombre.trim().length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres");
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push("El email no es válido");
  }

  // Validar password
  if (!password || password.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres");
  }

  // Validar teléfono (opcional)
  if (telefono && telefono.length < 10) {
    errores.push("El teléfono debe tener al menos 10 dígitos");
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      errores: errores,
    });
  }

  next();
};

/**
 * Middleware para validar datos de cita
 */
export const validarCitaMiddleware = (req, res, next) => {
  const { barbero_id, servicio_id, fecha, hora } = req.body;
  const errores = [];

  if (!barbero_id) {
    errores.push("El barbero es requerido");
  }

  if (!servicio_id) {
    errores.push("El servicio es requerido");
  }

  if (!fecha) {
    errores.push("La fecha es requerida");
  }

  if (!hora) {
    errores.push("La hora es requerida");
  }

  // Validar formato de fecha (YYYY-MM-DD)
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (fecha && !fechaRegex.test(fecha)) {
    errores.push("El formato de fecha debe ser YYYY-MM-DD");
  }

  // Validar formato de hora (HH:MM)
  const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (hora && !horaRegex.test(hora)) {
    errores.push("El formato de hora debe ser HH:MM");
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      errores: errores,
    });
  }

  next();
};

/**
 * Middleware para validar datos de servicio
 */
export const validarServicioMiddleware = (req, res, next) => {
  const { nombre, duracion, precio, descripcion } = req.body;
  const errores = [];

  // Validar nombre
  if (!nombre || nombre.trim().length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres");
  }

  // Validar duración (entre 5 y 240 minutos)
  if (!duracion || duracion < 5 || duracion > 240) {
    errores.push("La duración debe estar entre 5 y 240 minutos");
  }

  // Validar precio (mayor a 0)
  if (!precio || precio <= 0) {
    errores.push("El precio debe ser mayor a 0");
  }

  // Validar que precio sea número
  if (precio && isNaN(parseFloat(precio))) {
    errores.push("El precio debe ser un número válido");
  }

  // Validar descripción (opcional)
  if (descripcion && descripcion.length > 500) {
    errores.push("La descripción no puede tener más de 500 caracteres");
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      errores: errores,
    });
  }

  next();
};

/**
 * Middleware para validar ID
 */
export const validarIdMiddleware = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      mensaje: "ID inválido",
    });
  }

  req.params.id = id;
  next();
};

export default {
  validarRegistroMiddleware,
  validarCitaMiddleware,
  validarServicioMiddleware,
  validarIdMiddleware,
};
