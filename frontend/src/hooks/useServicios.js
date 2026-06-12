// frontend/src/hooks/useServicios.js
import { useCallback } from "react";
import { useApi } from "./useApi";
import * as servicioService from "../services/servicioService";

export const useServicios = () => {
  const listarApi = useApi(servicioService.getServicios);
  const obtenerApi = useApi(servicioService.getServicioById);
  const crearApi = useApi(servicioService.crearServicio, {
    showSuccess: "Servicio creado exitosamente",
  });
  const actualizarApi = useApi(servicioService.actualizarServicio, {
    showSuccess: "Servicio actualizado exitosamente",
  });
  const eliminarApi = useApi(servicioService.eliminarServicio, {
    showSuccess: "Servicio eliminado exitosamente",
  });
  const toggleActivoApi = useApi(servicioService.toggleActivoServicio);
  const barberosPorServicioApi = useApi(servicioService.getBarberosPorServicio);

  const loading =
    listarApi.loading ||
    crearApi.loading ||
    actualizarApi.loading ||
    eliminarApi.loading;

  const error =
    listarApi.error ||
    crearApi.error ||
    actualizarApi.error ||
    eliminarApi.error;

  return {
    loading,
    error,
    listar: useCallback(
      (soloActivos) => listarApi.ejecutar(soloActivos),
      [listarApi],
    ),
    obtener: useCallback((id) => obtenerApi.ejecutar(id), [obtenerApi]),
    crear: useCallback((data) => crearApi.ejecutar(data), [crearApi]),
    actualizar: useCallback(
      (id, data) => actualizarApi.ejecutar(id, data),
      [actualizarApi],
    ),
    eliminar: useCallback((id) => eliminarApi.ejecutar(id), [eliminarApi]),
    toggleActivo: useCallback(
      (id) => toggleActivoApi.ejecutar(id),
      [toggleActivoApi],
    ),
    barberosPorServicio: useCallback(
      (id) => barberosPorServicioApi.ejecutar(id),
      [barberosPorServicioApi],
    ),
  };
};

export default useServicios;
