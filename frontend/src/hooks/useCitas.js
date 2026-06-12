// frontend/src/hooks/useCitas.js
import { useCallback } from "react";
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

  const loading =
    misCitasApi.loading ||
    crearCitaApi.loading ||
    cancelarCitaApi.loading ||
    reagendarCitaApi.loading ||
    confirmarCitaApi.loading ||
    finalizarCitaApi.loading;

  const error =
    misCitasApi.error ||
    crearCitaApi.error ||
    cancelarCitaApi.error ||
    reagendarCitaApi.error;

  return {
    loading,
    error,
    // Cliente
    misCitas: useCallback(() => misCitasApi.ejecutar(), [misCitasApi]),
    proximasCitas: useCallback(
      () => proximasCitasApi.ejecutar(),
      [proximasCitasApi],
    ),
    historialCitas: useCallback(
      (limite) => historialCitasApi.ejecutar(limite),
      [historialCitasApi],
    ),
    crearCita: useCallback(
      (data) => crearCitaApi.ejecutar(data),
      [crearCitaApi],
    ),
    cancelarCita: useCallback(
      (id) => cancelarCitaApi.ejecutar(id),
      [cancelarCitaApi],
    ),
    reagendarCita: useCallback(
      (id, data) => reagendarCitaApi.ejecutar(id, data),
      [reagendarCitaApi],
    ),
    // Barbero
    citasBarbero: useCallback(
      (barberoId, fecha) => citasBarberoApi.ejecutar(barberoId, fecha),
      [citasBarberoApi],
    ),
    agendaSemana: useCallback(
      (barberoId, fecha) => agendaSemanaApi.ejecutar(barberoId, fecha),
      [agendaSemanaApi],
    ),
    verificarDisponibilidad: useCallback(
      (barberoId, fecha, hora) =>
        verificarDisponibilidadApi.ejecutar(barberoId, fecha, hora),
      [verificarDisponibilidadApi],
    ),
    confirmarCita: useCallback(
      (id) => confirmarCitaApi.ejecutar(id),
      [confirmarCitaApi],
    ),
    finalizarCita: useCallback(
      (id) => finalizarCitaApi.ejecutar(id),
      [finalizarCitaApi],
    ),
    actualizarEstado: useCallback(
      (id, estado) => actualizarEstadoApi.ejecutar(id, estado),
      [actualizarEstadoApi],
    ),
    getResumenCitas: useCallback(
      () => getResumenCitasApi.ejecutar(),
      [getResumenCitasApi],
    ),
    // Admin
    crearCitaAdmin: useCallback(
      (data) => crearCitaAdminApi.ejecutar(data),
      [crearCitaAdminApi],
    ),
    getAllCitas: useCallback(
      (filtros) => getAllCitasApi.ejecutar(filtros),
      [getAllCitasApi],
    ),
    getDashboard: useCallback(
      () => getDashboardApi.ejecutar(),
      [getDashboardApi],
    ),
    getReporteIngresos: useCallback(
      (periodo, inicio, fin) =>
        getReporteIngresosApi.ejecutar(periodo, inicio, fin),
      [getReporteIngresosApi],
    ),
    getServiciosTop: useCallback(
      (limite, inicio, fin) => getServiciosTopApi.ejecutar(limite, inicio, fin),
      [getServiciosTopApi],
    ),
    getClientesTop: useCallback(
      (limite, inicio, fin) => getClientesTopApi.ejecutar(limite, inicio, fin),
      [getClientesTopApi],
    ),
    getDistribucionHoraria: useCallback(
      (inicio, fin) => getDistribucionHorariaApi.ejecutar(inicio, fin),
      [getDistribucionHorariaApi],
    ),
    getTasaCancelacion: useCallback(
      (inicio, fin) => getTasaCancelacionApi.ejecutar(inicio, fin),
      [getTasaCancelacionApi],
    ),
  };
};

export default useCitas;
