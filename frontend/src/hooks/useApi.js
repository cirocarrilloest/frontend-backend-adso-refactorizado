// frontend/src/hooks/useApi.js
import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "../context/ToastContext";

/**
 * Hook genérico para manejar llamadas a la API
 * Maneja loading, error, y data automáticamente
 *
 * @param {Function} apiFunction - Función async que hace la llamada API
 * @param {Object} options - Opciones adicionales
 * @returns {Object} { data, loading, error, ejecutar, limpiar }
 */
export function useApi(apiFunction, options = {}) {
  const { showSuccess, showError, onSuccess, onError } = options;
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Usar refs para valores que no deben cambiar entre renders
  const apiFunctionRef = useRef(apiFunction);
  const optionsRef = useRef({ showSuccess, showError, onSuccess, onError });
  const isMounted = useRef(true);

  // Actualizar refs cuando cambien
  useEffect(() => {
    apiFunctionRef.current = apiFunction;
    optionsRef.current = { showSuccess, showError, onSuccess, onError };
  }, [apiFunction, showSuccess, showError, onSuccess, onError]);

  // Limpiar al desmontar
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ Memoizar ejecutar con dependencias mínimas
  const ejecutar = useCallback(
    async (...args) => {
      if (!isMounted.current) return null;

      setLoading(true);
      setError(null);

      try {
        const resultado = await apiFunctionRef.current(...args);

        if (isMounted.current) {
          setData(resultado);

          if (optionsRef.current.showSuccess) {
            const successMsg =
              optionsRef.current.showSuccess === true
                ? "Operación exitosa"
                : optionsRef.current.showSuccess;
            addToast(successMsg, "success");
          }

          if (optionsRef.current.onSuccess) {
            optionsRef.current.onSuccess(resultado);
          }
        }

        return resultado;
      } catch (err) {
        if (isMounted.current) {
          const message =
            err.response?.data?.message || err.message || "Error inesperado";
          setError(message);

          if (optionsRef.current.showError !== false) {
            addToast(message, "error");
          }

          if (optionsRef.current.onError) {
            optionsRef.current.onError(message);
          }
        }

        return null;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [addToast], // ✅ Solo depende de addToast (que es estable)
  );

  const limpiar = useCallback(() => {
    if (isMounted.current) {
      setData(null);
      setError(null);
    }
  }, []);

  return { data, loading, error, ejecutar, limpiar };
}

export default useApi;
