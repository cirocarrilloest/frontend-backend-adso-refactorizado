// backend/src/services/adminCitaService.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { crearCitaAdmin } from "./adminCitaService/crearService.js";
import { editarCitaAdmin } from "./adminCitaService/editarService.js";
import {
  getAllCitas,
  getCitasCercanas,
} from "./adminCitaService/consultasService.js";
import {
  getDashboardStats,
  getReporteIngresos,
} from "./adminCitaService/estadisticasService.js";

// RE-EXPORTAR
export {
  crearCitaAdmin,
  editarCitaAdmin,
  getAllCitas,
  getCitasCercanas,
  getDashboardStats,
  getReporteIngresos,
};

// Export default para compatibilidad
export default {
  crearCitaAdmin,
  editarCitaAdmin,
  getAllCitas,
  getCitasCercanas,
  getDashboardStats,
  getReporteIngresos,
};
