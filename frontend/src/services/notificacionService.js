// frontend/src/services/notificacionService.js
import api from "./axiosConfig";

/** Obtener notificaciones del usuario */
export const getNotificaciones = async (soloNoLeidas = false, limite = 20) => {
  const { data } = await api.get("/notificaciones", {
    params: { soloNoLeidas, limite },
  });
  return data;
};

/** Contar notificaciones no leídas */
export const contarNoLeidas = async () => {
  const { data } = await api.get("/notificaciones/contar-no-leidas");
  return data;
};

/** Marcar notificación como leída */
export const marcarNotificacionLeida = async (id) => {
  const { data } = await api.patch(`/notificaciones/${id}/leer`);
  return data;
};

/** Marcar todas como leídas */
export const marcarTodasLeidas = async () => {
  const { data } = await api.patch("/notificaciones/leer-todas");
  return data;
};
