// frontend/src/services/configService.js
import api from "./axiosConfig";

/** Obtener toda la configuración */
export const getConfiguracion = async () => {
  const { data } = await api.get("/config");
  return data;
};

/** Obtener una configuración específica */
export const getConfigByKey = async (key) => {
  const { data } = await api.get(`/config/${key}`);
  return data;
};

/** Actualizar una configuración */
export const updateConfig = async (key, valor) => {
  const { data } = await api.put(`/config/${key}`, { valor });
  return data;
};

/** Actualizar múltiples configuraciones */
export const updateMultipleConfig = async (configuraciones) => {
  const { data } = await api.post("/config/batch", { configuraciones });
  return data;
};
