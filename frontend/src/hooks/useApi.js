// src/hooks/useApi.js
import { useState, useCallback } from "react";

/**
 * Hook genérico para manejar llamadas a la API.
 * Encapsula loading, error y data en un solo lugar.
 *
 */
export function useApi(fn, opciones = {}) {
  const { onSuccess, onError } = opciones;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const resultado = await fn(...args);
        setData(resultado);
        onSuccess?.(resultado);
        return resultado;
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Error inesperado";
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn, onSuccess, onError],
  );

  const limpiar = () => {
    setData(null);
    setError(null);
  };

  return { data, loading, error, ejecutar, limpiar };
}
