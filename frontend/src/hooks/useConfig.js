// frontend/src/hooks/useConfig.js
/**
 * useConfig.js - Hook personalizado para usar configuración
 */

import { useConfig as useConfigContext } from "../context/ConfigContext";

export const useConfig = () => {
  const configContext = useConfigContext();

  // Validación: asegurar que se usa dentro de ConfigProvider
  if (!configContext) {
    throw new Error("useConfig must be used within ConfigProvider");
  }

  // Extraer todas las propiedades del contexto
  const {
    config,
    loading,
    error,
    getValue,
    getNumber,
    getMoneda,
    formatearPrecio,
    estaAbierto,
    esDiaLaborable,
    estaEnHorarioLaboral,
    generarSlotsHorarios,
    recargar,
  } = configContext;

  // Retornar todas las funciones y propiedades disponibles
  return {
    // Estados
    config,
    loading,
    error,

    // Funciones básicas
    getValue,
    getNumber,
    getMoneda,

    // Formateo
    formatearPrecio,

    // Validaciones
    estaAbierto,
    esDiaLaborable,
    estaEnHorarioLaboral,

    // Utilidades
    generarSlotsHorarios,

    // Acciones
    recargar,
  };
};

export default useConfig;
