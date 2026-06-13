// backend/src/models/citaModel.js
// Punto de entrada principal - Re-exporta todos los módulos

export {
  // Consultas básicas
  createCita,
  getCitaById,
  updateCita,
  updateCitaEstado,
  updateCitaAdmin,
  cancelarCita,
  verificarDuplicado,

  // Consultas para cliente
  getCitasByCliente,
  getProximasCitasByCliente,
  getHistorialCitasByCliente,

  // Consultas para barbero
  getCitasByBarbero,
  getAgendaDiaByBarbero,
  getCitasSemanaByBarbero,
  getResumenCitasByBarbero,

  // Consultas para admin
  getAllCitas,
  getDashboardStats,

  // Disponibilidad
  verificarDisponibilidad,
  verificarHorarioLaboral,
  getHorariosOcupados,
  getHorariosDisponibles,
  getHorarioBarberoPorDia,

  // Estadísticas y reportes
  getReporteIngresos,
  getServiciosMasSolicitados,
  getClientesMasFrecuentes,
  getDistribucionCitasPorHora,
  getTasaCancelacionPorBarbero,
} from "./citaModel/index.js";
