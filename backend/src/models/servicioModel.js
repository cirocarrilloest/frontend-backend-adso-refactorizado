// backend/src/models/servicioModel.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  createServicio,
  getAllServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
} from "./servicioModel/crudModel.js";

// RE-EXPORTAR
export {
  createServicio,
  getAllServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
};

// Export default para compatibilidad
export default {
  createServicio,
  getAllServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
};
