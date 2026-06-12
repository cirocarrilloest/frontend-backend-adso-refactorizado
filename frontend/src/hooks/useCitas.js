// frontend/src/hooks/useCitas.js
import { useCallback, useMemo } from "react";
import { useApi } from "./useApi";
import * as citaService from "../services/citaService";

export const useCitas = () => {
  // Cliente
  const misCitasApi = useApi(citaService.getMisCitas);
  const proximasCitasApi = useApi(citaService.getProximasCitas);
  const historialCitasApi = useApi(citaService.getHistorialCitas);
  const crearCitaApi = useApi(citaService.agendarCita, {
    showSuccess: "Cita agendada exitosamente",
  });
  const cancelarCitaApi = useApi(citaService.cancelarCita, {
    showSuccess: "Cita cancelada exitosamente",
  });
  const reagendarCitaApi = useApi(citaService.reagendarCita, {
    showSuccess: "Cita reagendada exitosamente",
  });

  // Barbero / Admin
  const citasBarberoApi = useApi(citaService.getCitasBarbero);
  const agendaSemanaApi = useApi(citaService.getAgendaSemana);
  const verificarDisponibilidadApi = useApi(
    citaService.verificarDisponibilidad,
  );
  const confirmarCitaApi = useApi(citaService.confirmarCita, {
    showSuccess: "Cita confirmada",
  });
  const finalizarCitaApi = useApi(citaService.finalizarCita, {
    showSuccess: "Cita completada",
  });
  const actualizarEstadoApi = useApi(citaService.actualizarEstadoCita);
  const getResumenCitasApi = useApi(citaService.getResumenCitas);

  // Admin - Dashboard
  const crearCitaAdminApi = useApi(citaService.crearCitaAdmin, {
    showSuccess: "Cita creada exitosamente",
  });
  const getAllCitasApi = useApi(citaService.getAllCitas);
  const getDashboardApi = useApi(citaService.getDashboard);
  const getReporteIngresosApi = useApi(citaService.getReporteIngresos);
  const getServiciosTopApi = useApi(citaService.getServiciosTop);
  const getClientesTopApi = useApi(citaService.getClientesTop);
  const getDistribucionHorariaApi = useApi(citaService.getDistribucionHoraria);
  const getTasaCancelacionApi = useApi(citaService.getTasaCancelacion);

  // ✅ Memoizar ejecutores con useCallback
  const misCitas = useCallback(
    () => misCitasApi.ejecutar(),
    [misCitasApi.ejecutar],
  );
  const proximasCitas = useCallback(
    () => proximasCitasApi.ejecutar(),
    [proximasCitasApi.ejecutar],
  );
  const historialCitas = useCallback(
    (limite) => historialCitasApi.ejecutar(limite),
    [historialCitasApi.ejecutar],
  );
  const crearCita = useCallback(
    (data) => crearCitaApi.ejecutar(data),
    [crearCitaApi.ejecutar],
  );
  const cancelarCita = useCallback(
    (id) => cancelarCitaApi.ejecutar(id),
    [cancelarCitaApi.ejecutar],
  );
  const reagendarCita = useCallback(
    (id, data) => reagendarCitaApi.ejecutar(id, data),
    [reagendarCitaApi.ejecutar],
  );

  // Barbero
  const citasBarbero = useCallback(
    (barberoId, fecha, estado, limit) =>
      citasBarberoApi.ejecutar(barberoId, fecha, estado, limit),
    [citasBarberoApi.ejecutar],
  );
  const agendaSemana = useCallback(
    (barberoId, fecha) => agendaSemanaApi.ejecutar(barberoId, fecha),
    [agendaSemanaApi.ejecutar],
  );
  const verificarDisponibilidad = useCallback(
    (barberoId, fecha, hora) =>
      verificarDisponibilidadApi.ejecutar(barberoId, fecha, hora),
    [verificarDisponibilidadApi.ejecutar],
  );
  const confirmarCita = useCallback(
    (id) => confirmarCitaApi.ejecutar(id),
    [confirmarCitaApi.ejecutar],
  );
  const finalizarCita = useCallback(
    (id) => finalizarCitaApi.ejecutar(id),
    [finalizarCitaApi.ejecutar],
  );
  const actualizarEstado = useCallback(
    (id, estado) => actualizarEstadoApi.ejecutar(id, estado),
    [actualizarEstadoApi.ejecutar],
  );
  const getResumenCitas = useCallback(
    (fechaInicio, fechaFin) =>
      getResumenCitasApi.ejecutar(fechaInicio, fechaFin),
    [getResumenCitasApi.ejecutar],
  );

  // Admin
  const crearCitaAdmin = useCallback(
    (data) => crearCitaAdminApi.ejecutar(data),
    [crearCitaAdminApi.ejecutar],
  );
  const getAllCitas = useCallback(
    (filtros) => getAllCitasApi.ejecutar(filtros),
    [getAllCitasApi.ejecutar],
  );
  const getDashboard = useCallback(
    () => getDashboardApi.ejecutar(),
    [getDashboardApi.ejecutar],
  );
  const getReporteIngresos = useCallback(
    (periodo, inicio, fin) =>
      getReporteIngresosApi.ejecutar(periodo, inicio, fin),
    [getReporteIngresosApi.ejecutar],
  );
  const getServiciosTop = useCallback(
    (limite, inicio, fin) => getServiciosTopApi.ejecutar(limite, inicio, fin),
    [getServiciosTopApi.ejecutar],
  );
  const getClientesTop = useCallback(
    (limite, inicio, fin) => getClientesTopApi.ejecutar(limite, inicio, fin),
    [getClientesTopApi.ejecutar],
  );
  const getDistribucionHoraria = useCallback(
    (inicio, fin, barberoId) =>
      getDistribucionHorariaApi.ejecutar(inicio, fin, barberoId),
    [getDistribucionHorariaApi.ejecutar],
  );
  const getTasaCancelacion = useCallback(
    (inicio, fin) => getTasaCancelacionApi.ejecutar(inicio, fin),
    [getTasaCancelacionApi.ejecutar],
  );

  // Estados combinados con useMemo
  const loading = useMemo(
    () =>
      misCitasApi.loading ||
      crearCitaApi.loading ||
      cancelarCitaApi.loading ||
      reagendarCitaApi.loading ||
      confirmarCitaApi.loading ||
      finalizarCitaApi.loading ||
      getDistribucionHorariaApi.loading ||
      getTasaCancelacionApi.loading,
    [
      misCitasApi.loading,
      crearCitaApi.loading,
      cancelarCitaApi.loading,
      reagendarCitaApi.loading,
      confirmarCitaApi.loading,
      finalizarCitaApi.loading,
      getDistribucionHorariaApi.loading,
      getTasaCancelacionApi.loading,
    ],
  );

  const error = useMemo(
    () =>
      misCitasApi.error ||
      crearCitaApi.error ||
      cancelarCitaApi.error ||
      reagendarCitaApi.error ||
      getDistribucionHorariaApi.error ||
      getTasaCancelacionApi.error,
    [
      misCitasApi.error,
      crearCitaApi.error,
      cancelarCitaApi.error,
      reagendarCitaApi.error,
      getDistribucionHorariaApi.error,
      getTasaCancelacionApi.error,
    ],
  );

  return {
    loading,
    error,
    // Cliente
    misCitas,
    proximasCitas,
    historialCitas,
    crearCita,
    cancelarCita,
    reagendarCita,
    // Barbero
    citasBarbero,
    agendaSemana,
    verificarDisponibilidad,
    confirmarCita,
    finalizarCita,
    actualizarEstado,
    getResumenCitas,
    // Admin
    crearCitaAdmin,
    getAllCitas,
    getDashboard,
    getReporteIngresos,
    getServiciosTop,
    getClientesTop,
    getDistribucionHoraria,
    getTasaCancelacion,
  };
};

export default useCitas;
