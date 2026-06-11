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
