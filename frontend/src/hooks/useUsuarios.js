// src/hooks/useUsuarios.js
import { useCallback, useMemo } from "react";
import { useApi } from "./useApi";
import * as usuarioService from "../services/usuarioService";

/**
 * Hook para manejar operaciones de usuarios
 * Usa useApi internamente para estandarizar loading/error
 */
export const useUsuarios = () => {
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

  // Nueva función: Contadores de usuarios por rol
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

  // ✅ Memoizar ejecutores con useCallback
  const listar = useCallback(
    (filtros) => listarApi.ejecutar(filtros),
    [listarApi],
  );
  const obtener = useCallback((id) => obtenerApi.ejecutar(id), [obtenerApi]);
  const crear = useCallback((data) => crearApi.ejecutar(data), [crearApi]);
  const actualizar = useCallback(
    (id, data) => actualizarApi.ejecutar(id, data),
    [actualizarApi],
  );
  const eliminar = useCallback((id) => eliminarApi.ejecutar(id), [eliminarApi]);
  const cambiarRol = useCallback(
    (id, rol) => cambiarRolApi.ejecutar(id, rol),
    [cambiarRolApi],
  );
  const cambiarPassword = useCallback(
    (id, pass) => cambiarPasswordApi.ejecutar(id, pass),
    [cambiarPasswordApi],
  );

  // ✅ IMPORTANTE: listarBarberos debe ser estable entre renders
  const listarBarberos = useCallback(
    () => listarBarberosApi.ejecutar(),
    [listarBarberosApi],
  );
  const perfilBarbero = useCallback(
    (id) => perfilBarberoApi.ejecutar(id),
    [perfilBarberoApi],
  );
  const horarioBarbero = useCallback(
    (id) => horarioBarberoApi.ejecutar(id),
    [horarioBarberoApi],
  );
  const configurarHorario = useCallback(
    (id, data) => configurarHorarioApi.ejecutar(id, data),
    [configurarHorarioApi],
  );
  const eliminarHorario = useCallback(
    (id, dia) => eliminarHorarioApi.ejecutar(id, dia),
    [eliminarHorarioApi],
  );

  // Estados combinados con useMemo para evitar recálculos innecesarios
  const loading = useMemo(
    () =>
      listarApi.loading ||
      obtenerApi.loading ||
      crearApi.loading ||
      actualizarApi.loading ||
      eliminarApi.loading ||
      listarBarberosApi.loading ||
      getUserCountsApi.loading,
    [
      listarApi.loading,
      obtenerApi.loading,
      crearApi.loading,
      actualizarApi.loading,
      eliminarApi.loading,
      listarBarberosApi.loading,
      getUserCountsApi.loading,
    ],
  );

  const error = useMemo(
    () =>
      listarApi.error ||
      obtenerApi.error ||
      crearApi.error ||
      actualizarApi.error ||
      eliminarApi.error ||
      listarBarberosApi.error ||
      getUserCountsApi.error,
    [
      listarApi.error,
      obtenerApi.error,
      crearApi.error,
      actualizarApi.error,
      eliminarApi.error,
      listarBarberosApi.error,
      getUserCountsApi.error,
    ],
  );

  return {
    // Estados
    loading,
    error,
    // Operaciones CRUD
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    cambiarRol,
    cambiarPassword,
    // Nueva función de conteos
    getUserCounts: useCallback(
      () => getUserCountsApi.ejecutar(),
      [getUserCountsApi],
    ),
    // Operaciones de barberos
    listarBarberos,
    perfilBarbero,
    horarioBarbero,
    configurarHorario,
    eliminarHorario,
  };
};

export default useUsuarios;
