// frontend/src/hooks/useServicios.js
import { useState, useCallback } from "react";
import {
  getServicios,
  getServicioById,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  toggleActivoServicio,
  getBarberosPorServicio,
} from "../services/servicioService";

export const useServicios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Error en la operación";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listar = useCallback(
    (soloActivos) => handleRequest(getServicios, soloActivos),
    [handleRequest],
  );
  const obtener = useCallback(
    (id) => handleRequest(getServicioById, id),
    [handleRequest],
  );
  const crear = useCallback(
    (data) => handleRequest(crearServicio, data),
    [handleRequest],
  );
  const actualizar = useCallback(
    (id, data) => handleRequest(actualizarServicio, id, data),
    [handleRequest],
  );
  const eliminar = useCallback(
    (id) => handleRequest(eliminarServicio, id),
    [handleRequest],
  );
  const toggleActivo = useCallback(
    (id) => handleRequest(toggleActivoServicio, id),
    [handleRequest],
  );
  const barberosPorServicio = useCallback(
    (id) => handleRequest(getBarberosPorServicio, id),
    [handleRequest],
  );

  return {
    loading,
    error,
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    toggleActivo,
    barberosPorServicio,
  };
};

export default useServicios;
