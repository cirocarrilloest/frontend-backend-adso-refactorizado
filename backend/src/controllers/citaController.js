// src/controllers/citaController.js
// Punto de entrada principal - Solo re-exporta todos los módulos

export {
  // Cliente
  agendarCita,
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
  cancelarCita,
  reagendarCita,

  // Barbero
  getAgendaDia,
  getAgendaSemana,
  confirmarCita,
  finalizarCita,
  actualizarEstadoCita,
  getCitasBarbero,
  getResumenCitas,

  // Admin
  crearCitaAdmin,
  editarCitaAdmin,
  getAllCitas,

  // Disponibilidad (compartido)
  getHorariosDisponibles,
  verificarDisponibilidad,

  // Comunes
  getCitaById,

  // Reportes
  getDashboard,
  getDistribucionHoraria,
  getReporteIngresos,
  getServiciosTop,
  getClientesTop,
  getTasaCancelacion,
  getTasaCancelacionPorBarbero,
} from "./citaController/index.js";
