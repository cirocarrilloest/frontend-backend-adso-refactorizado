// backend/src/models/citaModel/index.js

// Importar desde cada módulo
import * as basicas from "./queriesBasicas.js";
import * as cliente from "./queriesCliente.js";
import * as barbero from "./queriesBarbero.js";
import * as admin from "./queriesAdmin.js";
import * as disponibilidad from "./queriesDisponibilidad.js";
import * as estadisticas from "./queriesEstadisticas.js";

// Re-exportar básicas
export const createCita = basicas.createCita;
export const getCitaById = basicas.getCitaById;
export const updateCita = basicas.updateCita;
export const updateCitaEstado = basicas.updateCitaEstado;
export const updateCitaAdmin = basicas.updateCitaAdmin;
export const cancelarCita = basicas.cancelarCita;
export const verificarDuplicado = basicas.verificarDuplicado;

// Re-exportar cliente
export const getCitasByCliente = cliente.getCitasByCliente;
export const getProximasCitasByCliente = cliente.getProximasCitasByCliente;
export const getHistorialCitasByCliente = cliente.getHistorialCitasByCliente;

// Re-exportar barbero
export const getCitasByBarbero = barbero.getCitasByBarbero;
export const getAgendaDiaByBarbero = barbero.getAgendaDiaByBarbero;
export const getCitasSemanaByBarbero = barbero.getCitasSemanaByBarbero;
export const getResumenCitasByBarbero = barbero.getResumenCitasByBarbero;

// Re-exportar admin
export const getAllCitas = admin.getAllCitas;
export const getDashboardStats = admin.getDashboardStats;

// Re-exportar disponibilidad
export const verificarDisponibilidad = disponibilidad.verificarDisponibilidad;
export const verificarHorarioLaboral = disponibilidad.verificarHorarioLaboral;
export const getHorariosOcupados = disponibilidad.getHorariosOcupados;
export const getHorariosDisponibles = disponibilidad.getHorariosDisponibles;
export const getHorarioBarberoPorDia = disponibilidad.getHorarioBarberoPorDia;

// Re-exportar estadísticas
export const getReporteIngresos = estadisticas.getReporteIngresos;
export const getServiciosMasSolicitados =
  estadisticas.getServiciosMasSolicitados;
export const getClientesMasFrecuentes = estadisticas.getClientesMasFrecuentes;
export const getDistribucionCitasPorHora =
  estadisticas.getDistribucionCitasPorHora;
export const getTasaCancelacionPorBarbero =
  estadisticas.getTasaCancelacionPorBarbero;
