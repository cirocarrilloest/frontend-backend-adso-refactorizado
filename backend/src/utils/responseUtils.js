// src/utils/responseUtils.js
/**
 * Helpers de respuesta HTTP estandarizados.
 * Todos los controladores DEBEN usar estas funciones.
 */

export const ok = (res, data = {}, status = 200) => {
  return res.status(status).json({ ok: true, ...data });
};

export const created = (res, data = {}) => {
  return res.status(201).json({ ok: true, ...data });
};

export const noContent = (res) => {
  return res.status(204).send();
};

export const badRequest = (res, message) => {
  return res.status(400).json({ ok: false, message });
};

export const unauthorized = (res, message = "No autenticado") => {
  return res.status(401).json({ ok: false, message });
};

export const forbidden = (res, message = "Acceso denegado") => {
  return res.status(403).json({ ok: false, message });
};

export const notFound = (res, message = "Recurso no encontrado") => {
  return res.status(404).json({ ok: false, message });
};

export const conflict = (res, message) => {
  return res.status(409).json({ ok: false, message });
};

export const serverError = (res, error = null) => {
  if (error) console.error("[ResponseError]", error.message || error);
  return res
    .status(500)
    .json({ ok: false, message: "Error interno del servidor" });
};
