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
    [listarApi.ejecutar],
  );
  const obtener = useCallback(
    (id) => obtenerApi.ejecutar(id),
    [obtenerApi.ejecutar],
  );
  const crear = useCallback(
    (data) => crearApi.ejecutar(data),
    [crearApi.ejecutar],
  );
  const actualizar = useCallback(
    (id, data) => actualizarApi.ejecutar(id, data),
    [actualizarApi.ejecutar],
  );
  const eliminar = useCallback(
    (id) => eliminarApi.ejecutar(id),
    [eliminarApi.ejecutar],
  );
  const cambiarRol = useCallback(
    (id, rol) => cambiarRolApi.ejecutar(id, rol),
    [cambiarRolApi.ejecutar],
  );
  const cambiarPassword = useCallback(
    (id, pass) => cambiarPasswordApi.ejecutar(id, pass),
    [cambiarPasswordApi.ejecutar],
  );

  // ✅ IMPORTANTE: listarBarberos debe ser estable entre renders
  const listarBarberos = useCallback(
    () => listarBarberosApi.ejecutar(),
    [listarBarberosApi.ejecutar],
  );
  const perfilBarbero = useCallback(
    (id) => perfilBarberoApi.ejecutar(id),
    [perfilBarberoApi.ejecutar],
  );
  const horarioBarbero = useCallback(
    (id) => horarioBarberoApi.ejecutar(id),
    [horarioBarberoApi.ejecutar],
  );
  const configurarHorario = useCallback(
    (id, data) => configurarHorarioApi.ejecutar(id, data),
    [configurarHorarioApi.ejecutar],
  );
  const eliminarHorario = useCallback(
    (id, dia) => eliminarHorarioApi.ejecutar(id, dia),
    [eliminarHorarioApi.ejecutar],
  );

  // Estados combinados con useMemo para evitar recálculos innecesarios
  const loading = useMemo(
    () =>
      listarApi.loading ||
      obtenerApi.loading ||
      crearApi.loading ||
      actualizarApi.loading ||
      eliminarApi.loading ||
      listarBarberosApi.loading,
    [
      listarApi.loading,
      obtenerApi.loading,
      crearApi.loading,
      actualizarApi.loading,
      eliminarApi.loading,
      listarBarberosApi.loading,
    ],
  );

  const error = useMemo(
    () =>
      listarApi.error ||
      obtenerApi.error ||
      crearApi.error ||
      actualizarApi.error ||
      eliminarApi.error ||
      listarBarberosApi.error,
    [
      listarApi.error,
      obtenerApi.error,
      crearApi.error,
      actualizarApi.error,
      eliminarApi.error,
      listarBarberosApi.error,
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
    // Operaciones de barberos
    listarBarberos,
    perfilBarbero,
    horarioBarbero,
    configurarHorario,
    eliminarHorario,
  };
};

export default useUsuarios;
