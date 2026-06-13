// src/controllers/citaController/index.js
// Este archivo importa todos los módulos y los re-exporta

// Importar desde cada módulo
import * as cliente from "./clienteModule.js";
import * as barbero from "./barberoModule.js";
import * as admin from "./adminModule.js";
import * as disponibilidad from "./disponibilidadModule.js";
import * as comunes from "./comunesModule.js";
import * as reportes from "./reportesModule.js";

// Re-exportar cliente
export const agendarCita = cliente.agendarCita;
export const getMisCitas = cliente.getMisCitas;
export const getProximasCitas = cliente.getProximasCitas;
export const getHistorialCitas = cliente.getHistorialCitas;
export const cancelarCita = cliente.cancelarCita;
export const reagendarCita = cliente.reagendarCita;

// Re-exportar barbero
export const getAgendaDia = barbero.getAgendaDia;
export const getAgendaSemana = barbero.getAgendaSemana;
export const confirmarCita = barbero.confirmarCita;
export const finalizarCita = barbero.finalizarCita;
export const actualizarEstadoCita = barbero.actualizarEstadoCita;
export const getCitasBarbero = barbero.getCitasBarbero;
export const getResumenCitas = barbero.getResumenCitas;

// Re-exportar admin
export const crearCitaAdmin = admin.crearCitaAdmin;
export const editarCitaAdmin = admin.editarCitaAdmin;
export const getAllCitas = admin.getAllCitas;

// Re-exportar disponibilidad
export const getHorariosDisponibles = disponibilidad.getHorariosDisponibles;
export const verificarDisponibilidad = disponibilidad.verificarDisponibilidad;

// Re-exportar comunes
export const getCitaById = comunes.getCitaById;

// Re-exportar reportes
export const getDashboard = reportes.getDashboard;
export const getDistribucionHoraria = reportes.getDistribucionHoraria;
export const getReporteIngresos = reportes.getReporteIngresos;
export const getServiciosTop = reportes.getServiciosTop;
export const getClientesTop = reportes.getClientesTop;
export const getTasaCancelacion = reportes.getTasaCancelacion;
export const getTasaCancelacionPorBarbero =
  reportes.getTasaCancelacionPorBarbero;
