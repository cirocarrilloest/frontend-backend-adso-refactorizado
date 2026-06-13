// backend/src/services/citaService/index.js

// Importar desde cada módulo
import * as cliente from "./clienteService.js";
import * as barbero from "./barberoService.js";
import * as admin from "./adminService.js";
import * as disponibilidad from "./disponibilidadService.js";

// Re-exportar cliente
export const agendarCita = cliente.agendarCita;
export const reagendarCita = cliente.reagendarCita;
export const cancelarCita = cliente.cancelarCita;

// Re-exportar barbero
export const actualizarEstadoCita = barbero.actualizarEstadoCita;
export const confirmarCita = barbero.confirmarCita;
export const finalizarCita = barbero.finalizarCita;

// Re-exportar admin
export const crearCitaAdmin = admin.crearCitaAdmin;
export const editarCitaAdmin = admin.editarCitaAdmin;

// Re-exportar disponibilidad
export const getHorariosDisponibles = disponibilidad.getHorariosDisponibles;
