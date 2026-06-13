// backend/src/services/citaService/constants.js

export const ESTADOS_VALIDOS = [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
];

export const ROLES = {
  CLIENTE: "cliente",
  BARBERO: "barbero",
  ADMIN: "admin",
};

export const TIPOS_NOTIFICACION = {
  CITA_NUEVA: "cita_nueva",
  CITA_CANCELADA: "cita_cancelada",
  CITA_CONFIRMADA: "cita_confirmada",
  CITA_EDITADA_ADMIN: "cita_editada_admin",
  SISTEMA: "sistema",
};
