// backend/src/services/adminCitaService/index.js

// Importar desde cada módulo
import { crearCitaAdmin } from "./crearService.js";
import { editarCitaAdmin } from "./editarService.js";
import { getAllCitas, getCitasCercanas } from "./consultasService.js";
import {
  getDashboardStats,
  getReporteIngresos,
} from "./estadisticasService.js";

// Re-exportar
export {
  crearCitaAdmin,
  editarCitaAdmin,
  getAllCitas,
  getCitasCercanas,
  getDashboardStats,
  getReporteIngresos,
};
