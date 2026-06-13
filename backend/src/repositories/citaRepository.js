// backend/src/repositories/citaRepository.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  create,
  findById,
  update,
  updateEstado,
  deleteCita,
} from "./citaRepository/crudQueries.js";
import { findByClienteId } from "./citaRepository/consultasCliente.js";
import {
  findByBarberoAndDate,
  findByBarberoAndDateRange,
} from "./citaRepository/consultasBarbero.js";
import {
  existsDuplicate,
  getHorariosOcupados,
  isWithinWorkingHours,
  getHorarioByDay,
} from "./citaRepository/disponibilidadQueries.js";
import { findAll, getCitasCercanas } from "./citaRepository/adminQueries.js";
import {
  getDashboardStats,
  getIngresosReport,
} from "./citaRepository/estadisticasQueries.js";

// RE-EXPORTAR
export const citaRepository = {
  // CRUD
  create,
  findById,
  update,
  updateEstado,
  delete: deleteCita,

  // Consultas cliente
  findByClienteId,

  // Consultas barbero
  findByBarberoAndDate,
  findByBarberoAndDateRange,

  // Disponibilidad
  existsDuplicate,
  getHorariosOcupados,
  isWithinWorkingHours,
  getHorarioByDay,

  // Admin
  findAll,
  getCitasCercanas,

  // Estadísticas
  getDashboardStats,
  getIngresosReport,
};

// Export default para compatibilidad
export default citaRepository;
