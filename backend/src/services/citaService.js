// backend/src/services/citaService.js
// Punto de entrada principal - Re-exporta todos los módulos

export {
  // Cliente
  agendarCita,
  reagendarCita,
  cancelarCita,

  // Barbero
  actualizarEstadoCita,
  confirmarCita,
  finalizarCita,

  // Admin
  crearCitaAdmin,
  editarCitaAdmin,

  // Disponibilidad
  getHorariosDisponibles,
} from "./citaService/index.js";
