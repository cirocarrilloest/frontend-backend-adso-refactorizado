// src/hooks/useUsuarios.js
import { useCallback, useMemo, useState, useRef } from "react";
import { useApi } from "./useApi";
import * as usuarioService from "../services/usuarioService";

/**
 * Hook para manejar operaciones de usuarios
 * Usa useApi internamente para estandarizar loading/error
 */
export const useUsuarios = () => {
  // Estado local para horario
  const [horario, setHorario] = useState(null);

  // Ref para evitar recreaciones innecesarias
  const mountedRef = useRef(true);

  // Operaciones CRUD básicas
  const listarApi = useApi(usuarioService.getUsuarios, { showError: false });
  const obtenerApi = useApi(usuarioService.getUsuarioById);
  const crearApi = useApi(usuarioService.createUsuario, {
    showSuccess: "Usuario creado exitosamente",
  });
  const actualizarApi = useApi(usuarioService.updateUsuario, {
    showSuccess: "Usuario actualizado exitosamente",
  });
  const eliminarApi = useApi(usuarioService.deleteUsuario, {
    showSuccess: "Usuario eliminado exitosamente",
  });
  const cambiarRolApi = useApi(usuarioService.asignarRol, {
    showSuccess: "Rol actualizado exitosamente",
  });
  const cambiarPasswordApi = useApi(usuarioService.cambiarPasswordAdmin, {
    showSuccess: "Contraseña actualizada",
  });

  // Contadores de usuarios por rol
  const getUserCountsApi = useApi(usuarioService.getUserCounts, {
    showError: false,
  });

  // Funciones específicas de barberos
  const listarBarberosApi = useApi(usuarioService.getBarberos);
  const perfilBarberoApi = useApi(usuarioService.getPerfilBarbero);
  const horarioBarberoApi = useApi(usuarioService.getHorarioBarbero);
  const configurarHorarioApi = useApi(usuarioService.setHorarioBarbero, {
    showSuccess: "Horario configurado",
  });
  const eliminarHorarioApi = useApi(usuarioService.deleteHorarioBarbero, {
    showSuccess: "Horario eliminado",
  });

  // Funciones memoizadas con useCallback estable
  const listarBarberos = useCallback(async () => {
    try {
      const data = await listarBarberosApi.ejecutar();
      return data;
    } catch (err) {
      console.error("Error al listar barberos:", err);
      throw err;
    }
  }, []); // ← Sin dependencia que cambie

  const horarioBarbero = useCallback(async (id) => {
    try {
      const data = await horarioBarberoApi.ejecutar(id);
      setHorario(data?.horarios || null);
      return data;
    } catch (err) {
      console.error("Error al obtener el horario:", err);
      setHorario(null);
      throw err;
    }
  }, []); // ← Sin dependencia que cambie

  const configurarHorario = useCallback(async (id, horarioData) => {
    try {
      const data = await configurarHorarioApi.ejecutar(id, horarioData);
      return data;
    } catch (err) {
      console.error("Error al configurar horario:", err);
      throw err;
    }
  }, []); // ← Sin dependencia que cambie

  const eliminarHorario = useCallback(async (id, dia) => {
    try {
      const data = await eliminarHorarioApi.ejecutar(id, dia);
      return data;
    } catch (err) {
      console.error("Error al eliminar horario:", err);
      throw err;
    }
  }, []); // ← Sin dependencia que cambie

  // Operaciones CRUD memoizadas
  const listar = useCallback((filtros) => listarApi.ejecutar(filtros), []);
  const obtener = useCallback((id) => obtenerApi.ejecutar(id), []);
  const crear = useCallback((data) => crearApi.ejecutar(data), []);
  const actualizar = useCallback(
    (id, data) => actualizarApi.ejecutar(id, data),
    [],
  );
  const eliminar = useCallback((id) => eliminarApi.ejecutar(id), []);
  const cambiarRol = useCallback(
    (id, rol) => cambiarRolApi.ejecutar(id, rol),
    [],
  );
  const cambiarPassword = useCallback(
    (id, pass) => cambiarPasswordApi.ejecutar(id, pass),
    [],
  );
  const perfilBarbero = useCallback((id) => perfilBarberoApi.ejecutar(id), []);

  // Loading combinado (solo actualiza cuando cambian los valores, no las referencias)
  const loading =
    listarApi.loading ||
    obtenerApi.loading ||
    crearApi.loading ||
    actualizarApi.loading ||
    eliminarApi.loading ||
    listarBarberosApi.loading ||
    getUserCountsApi.loading ||
    horarioBarberoApi.loading ||
    configurarHorarioApi.loading ||
    eliminarHorarioApi.loading;

  // Error combinado
  const error =
    listarApi.error ||
    obtenerApi.error ||
    crearApi.error ||
    actualizarApi.error ||
    eliminarApi.error ||
    listarBarberosApi.error ||
    getUserCountsApi.error ||
    horarioBarberoApi.error ||
    configurarHorarioApi.error ||
    eliminarHorarioApi.error;

  const getUserCounts = useCallback(() => getUserCountsApi.ejecutar(), []);

  return {
    loading,
    error,
    horario,
    listarBarberos,
    horarioBarbero,
    configurarHorario,
    eliminarHorario,
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    cambiarRol,
    cambiarPassword,
    getUserCounts,
    perfilBarbero,
  };
};

export default useUsuarios;
