// backend/src/models/servicioModel/index.js

// Importar desde cada módulo
import {
  createServicio,
  getAllServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
} from "./crudModel.js";

// Re-exportar
export {
  createServicio,
  getAllServicios,
  getServicioById,
  updateServicio,
  deleteServicio,
};
