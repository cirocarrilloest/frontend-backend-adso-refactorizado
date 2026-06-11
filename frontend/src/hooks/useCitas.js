// frontend/src/hooks/useCitas.js
/**
 * useCitas.js
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: reimplementaba el patrón useState + try/catch + setLoading
 *   siendo que useApi.js ya existía con exactamente ese patrón
 * - useCitas, useServicios y useUsuarios tenían copias casi idénticas de handleRequest
 * - Solución: usar useApi como base, exponer funciones memoizadas
 *
 * Principio aplicado: DRY — eliminar handleRequest duplicado en 3 hooks
 *
 * NOTA IMPORTANTE: los estados `loading` y `error` de este hook son globales
 * para todas las operaciones del hook. Si necesitas estados independientes por
 * operación, usa useApi directamente:
 *   const { loading, error, ejecutar } = useApi(agendarCita)
 */

import { useCallback, useState } from "react";
import * as citaService from "../services/citaService";

/**
 * Wrapper mínimo sobre una función async que maneja loading y error.
 * Versión simplificada de useApi para uso dentro de hooks de dominio.
 */
function useAsyncOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      return await fn(...args);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Error en la operación";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, ejecutar };
}

export const useCitas = () => {
  const { loading, error, ejecutar } = useAsyncOperation();

  return {
    loading,
    error,

    // Cliente
    misCitas: useCallback(() => ejecutar(citaService.getMisCitas), [ejecutar]),
    proximasCitas: useCallback(
      () => ejecutar(citaService.getProximasCitas),
      [ejecutar],
    ),
    historialCitas: useCallback(
      (limite) => ejecutar(citaService.getHistorialCitas, limite),
      [ejecutar],
    ),
    crearCita: useCallback(
      (data) => ejecutar(citaService.agendarCita, data),
      [ejecutar],
    ),
    cancelarCita: useCallback(
      (id) => ejecutar(citaService.cancelarCita, id),
      [ejecutar],
    ),
    reagendarCita: useCallback(
      (id, data) => ejecutar(citaService.reagendarCita, id, data),
      [ejecutar],
    ),

    // Barbero / Admin
    citasBarbero: useCallback(
      (barberoId, fecha) =>
        ejecutar(citaService.getCitasBarbero, barberoId, fecha),
      [ejecutar],
    ),
    agendaSemana: useCallback(
      (barberoId, fecha) =>
        ejecutar(citaService.getAgendaSemana, barberoId, fecha),
      [ejecutar],
    ),
    verificarDisponibilidad: useCallback(
      (barberoId, fecha, hora) =>
        ejecutar(citaService.verificarDisponibilidad, barberoId, fecha, hora),
      [ejecutar],
    ),
    confirmarCita: useCallback(
      (id) => ejecutar(citaService.confirmarCita, id),
      [ejecutar],
    ),
    finalizarCita: useCallback(
      (id) => ejecutar(citaService.finalizarCita, id),
      [ejecutar],
    ),
    actualizarEstado: useCallback(
      (id, estado) => ejecutar(citaService.actualizarEstadoCita, id, estado),
      [ejecutar],
    ),

    // Admin
    crearCitaAdmin: useCallback(
      (data) => ejecutar(citaService.crearCitaAdmin, data),
      [ejecutar],
    ),
    getAllCitas: useCallback(
      (filtros) => ejecutar(citaService.getAllCitas, filtros),
      [ejecutar],
    ),
    getDashboard: useCallback(
      () => ejecutar(citaService.getDashboard),
      [ejecutar],
    ),
  };
};

export default useCitas;
