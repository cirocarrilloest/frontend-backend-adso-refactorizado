// frontend/src/context/ConfigContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getConfiguracion } from "../services/configService";

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getConfiguracion();
      setConfig(res.configuracion || {});
    } catch (err) {
      console.error("Error cargando configuración:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarConfig();
  }, [cargarConfig]);

  // Obtener valor de una clave
  const getValue = (key, defaultValue = null) => {
    return config[key]?.valor ?? defaultValue;
  };

  // Obtener valor como booleano
  const getBoolean = (key, defaultValue = false) => {
    const val = config[key]?.valor;
    if (val === undefined) return defaultValue;
    return val === true || val === "true" || val === "1";
  };

  // Obtener valor como número
  const getNumber = (key, defaultValue = 0) => {
    const val = config[key]?.valor;
    if (val === undefined || val === null) return defaultValue;
    const num = Number(val);
    return isNaN(num) ? defaultValue : num;
  };

  // Obtener array (para días laborales, etc.)
  const getArray = (key, defaultValue = []) => {
    const val = config[key]?.valor;
    if (!val) return defaultValue;
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val.split(",").map((s) => s.trim().toLowerCase());
    }
    return defaultValue;
  };

  // Obtener moneda configurada
  const getMoneda = () => {
    return getValue("moneda", "COP");
  };

  // Formatear precio según moneda configurada
  const formatearPrecio = (precio) => {
    const moneda = getMoneda();
    const formato = getValue("formato_moneda", "es-CO");

    try {
      return new Intl.NumberFormat(formato, {
        style: "currency",
        currency: moneda,
        minimumFractionDigits: getNumber("decimales_moneda", 0),
        maximumFractionDigits: getNumber("decimales_moneda", 0),
      }).format(precio);
    } catch (e) {
      // Fallback si hay error
      return `${moneda} ${precio.toLocaleString()}`;
    }
  };

  // Verificar si un día es laborable
  const esDiaLaborable = (fecha) => {
    const diasLaborales = getArray("dias_laborales", [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ]);

    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    const fechaObj =
      typeof fecha === "string" ? new Date(fecha + "T12:00:00") : fecha;
    const diaSemana = diasSemana[fechaObj.getDay()];

    return diasLaborales.includes(diaSemana);
  };

  // Verificar si una hora está dentro del horario laboral
  const estaEnHorarioLaboral = (hora) => {
    const apertura = getValue("horario_apertura", "09:00");
    const cierre = getValue("horario_cierre", "20:00");
    const horaStr = String(hora).slice(0, 5);

    return horaStr >= apertura && horaStr < cierre;
  };

  // Generar slots de horarios disponibles
  const generarSlotsHorarios = () => {
    const apertura = getValue("horario_apertura", "09:00");
    const cierre = getValue("horario_cierre", "20:00");
    const duracionSlot = getNumber("duracion_slot_minutos", 30);

    const slots = [];
    let [horaApertura, minApertura] = apertura.split(":").map(Number);
    let [horaCierre, minCierre] = cierre.split(":").map(Number);

    let minutosActual = horaApertura * 60 + minApertura;
    const minutosCierre = horaCierre * 60 + minCierre;

    while (minutosActual < minutosCierre) {
      const hora = Math.floor(minutosActual / 60);
      const min = minutosActual % 60;
      slots.push(
        `${String(hora).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      );
      minutosActual += duracionSlot;
    }

    return slots;
  };

  // Verificar si una fecha/hora está disponible considerando días y horarios
  const verificarDisponibilidadGeneral = (fecha, hora) => {
    if (!esDiaLaborable(fecha)) return false;
    if (!estaEnHorarioLaboral(hora)) return false;
    return true;
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        error,
        getValue,
        getBoolean,
        getNumber,
        getArray,
        getMoneda,
        formatearPrecio,
        esDiaLaborable,
        estaEnHorarioLaboral,
        generarSlotsHorarios,
        verificarDisponibilidadGeneral,
        recargar: cargarConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig debe usarse dentro de ConfigProvider");
  }
  return context;
};
