// frontend/src/hooks/useUsuarios.js
import { useState, useCallback } from "react";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getBarberos,
  getPerfilBarbero,
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
} from "../services/usuarioService";

export const useUsuarios = () => {
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
    (filtros) => handleRequest(getUsuarios, filtros),
    [handleRequest],
  );
  const obtener = useCallback(
    (id) => handleRequest(getUsuarioById, id),
    [handleRequest],
  );
  const crear = useCallback(
    (data) => handleRequest(createUsuario, data),
    [handleRequest],
  );
  const actualizar = useCallback(
    (id, data) => handleRequest(updateUsuario, id, data),
    [handleRequest],
  );
  const eliminar = useCallback(
    (id) => handleRequest(deleteUsuario, id),
    [handleRequest],
  );
  const listarBarberos = useCallback(
    () => handleRequest(getBarberos),
    [handleRequest],
  );
  const perfilBarbero = useCallback(
    (id) => handleRequest(getPerfilBarbero, id),
    [handleRequest],
  );
  const horarioBarbero = useCallback(
    (id) => handleRequest(getHorarioBarbero, id),
    [handleRequest],
  );
  const configurarHorario = useCallback(
    (id, data) => handleRequest(setHorarioBarbero, id, data),
    [handleRequest],
  );
  const eliminarHorario = useCallback(
    (id, dia) => handleRequest(deleteHorarioBarbero, id, dia),
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
    listarBarberos,
    perfilBarbero,
    horarioBarbero,
    configurarHorario,
    eliminarHorario,
  };
};

export default useUsuarios;
