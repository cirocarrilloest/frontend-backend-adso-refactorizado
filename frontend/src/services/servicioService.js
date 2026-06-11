// frontend/src/services/servicioService.js
import api from "./axiosConfig";

/** Obtener todos los servicios */
export const getServicios = async (soloActivos = false) => {
  const { data } = await api.get("/servicios", {
    params: soloActivos ? { activos: "true" } : {},
  });
  return data;
};

/** Obtener servicio por ID */
export const getServicioById = async (id) => {
  const { data } = await api.get(`/servicios/${id}`);
  return data;
};

/** Barberos que realizan un servicio */
export const getBarberosPorServicio = async (id) => {
  const { data } = await api.get(`/servicios/${id}/barberos`);
  return data;
};

/** Crear servicio (admin) */
export const crearServicio = async ({
  nombre,
  descripcion,
  duracion,
  precio,
  activo,
}) => {
  const { data } = await api.post("/servicios", {
    nombre,
    descripcion,
    duracion,
    precio,
    activo,
  });
  return data;
};

/** Actualizar servicio (admin) */
export const actualizarServicio = async (id, campos) => {
  const { data } = await api.put(`/servicios/${id}`, campos);
  return data;
};

/** Activar/desactivar servicio (admin) */
export const toggleActivoServicio = async (id) => {
  const { data } = await api.patch(`/servicios/${id}/toggle-activo`);
  return data;
};

/** Eliminar servicio (admin) */
export const eliminarServicio = async (id) => {
  const { data } = await api.delete(`/servicios/${id}`);
  return data;
};
