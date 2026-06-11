// frontend/src/hooks/useCitas.js
import { useState, useCallback } from "react";
import {
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
  agendarCita,
  cancelarCita,
  reagendarCita,
  getCitasBarbero,
  getAgendaSemana,
  verificarDisponibilidad,
} from "../services/citaService";

export const useCitas = () => {
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

  const misCitas = useCallback(
    () => handleRequest(getMisCitas),
    [handleRequest],
  );
  const proximasCitas = useCallback(
    () => handleRequest(getProximasCitas),
    [handleRequest],
  );
  const historialCitas = useCallback(
    (limite) => handleRequest(getHistorialCitas, limite),
    [handleRequest],
  );
  const crearCita = useCallback(
    (data) => handleRequest(agendarCita, data),
    [handleRequest],
  );
  const cancelar = useCallback(
    (id) => handleRequest(cancelarCita, id),
    [handleRequest],
  );
  const reagendar = useCallback(
    (id, data) => handleRequest(reagendarCita, id, data),
    [handleRequest],
  );
  const citasBarbero = useCallback(
    (barberoId, fecha) => handleRequest(getCitasBarbero, barberoId, fecha),
    [handleRequest],
  );
  const agendaSemana = useCallback(
    (barberoId, fechaInicio) =>
      handleRequest(getAgendaSemana, barberoId, fechaInicio),
    [handleRequest],
  );
  const verificar = useCallback(
    (barberoId, fecha, hora) =>
      handleRequest(verificarDisponibilidad, barberoId, fecha, hora),
    [handleRequest],
  );

  return {
    loading,
    error,
    misCitas,
    proximasCitas,
    historialCitas,
    crearCita,
    cancelarCita: cancelar,
    reagendarCita: reagendar,
    citasBarbero,
    agendaSemana,
    verificarDisponibilidad: verificar,
  };
};

export default useCitas;
