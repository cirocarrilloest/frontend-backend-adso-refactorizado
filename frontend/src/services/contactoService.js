// frontend/src/services/contactoService.js
import api from "./axiosConfig";

/** Enviar mensaje de contacto (público) */
export const enviarMensajeContacto = async (datos) => {
  const { data } = await api.post("/contacto", datos);
  return data;
};

/** Obtener mensajes de contacto (admin) */
export const getMensajesContacto = async (soloNoLeidos = false) => {
  const { data } = await api.get("/contacto/mensajes", {
    params: { soloNoLeidos: soloNoLeidos.toString() },
  });
  return data;
};

/** Marcar mensaje como leído (admin) */
export const marcarMensajeLeido = async (id) => {
  const { data } = await api.patch(`/contacto/mensajes/${id}/leer`);
  return data;
};

/** ✅ ELIMINAR MENSAJE (admin) - FUNCIÓN FALTANTE */
export const eliminarMensaje = async (id) => {
  const { data } = await api.delete(`/contacto/mensajes/${id}`);
  return data;
};

/** ✅ ELIMINAR MÚLTIPLES MENSAJES (admin) */
export const eliminarMensajesMultiples = async (ids) => {
  const { data } = await api.post("/contacto/mensajes/eliminar-multiples", {
    ids,
  });
  return data;
};

/** ✅ OBTENER MENSAJE POR ID (admin) */
export const getMensajeById = async (id) => {
  const { data } = await api.get(`/contacto/mensajes/${id}`);
  return data;
};

/** ✅ MARCAR COMO RESPONDIDO (admin) */
export const marcarMensajeRespondido = async (id, respuesta) => {
  const { data } = await api.patch(`/contacto/mensajes/${id}/responder`, {
    respuesta,
  });
  return data;
};

/** ✅ OBTENER ESTADÍSTICAS (admin) */
export const getEstadisticasContacto = async () => {
  const { data } = await api.get("/contacto/estadisticas");
  return data;
};
