// backend/src/repositories/citaRepository/index.js

// CRUD
export {
  create,
  findById,
  update,
  updateEstado,
  deleteCita,
} from "./crudQueries.js";

// Consultas cliente
export { findByClienteId } from "./consultasCliente.js";

// Consultas barbero
export {
  findByBarberoAndDate,
  findByBarberoAndDateRange,
} from "./consultasBarbero.js";

// Disponibilidad
export {
  existsDuplicate,
  getHorariosOcupados,
  isWithinWorkingHours,
  getHorarioByDay,
} from "./disponibilidadQueries.js";

// Admin
export { findAll, getCitasCercanas } from "./adminQueries.js";

// Estadísticas
export { getDashboardStats, getIngresosReport } from "./estadisticasQueries.js";
