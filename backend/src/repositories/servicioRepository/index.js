// backend/src/repositories/servicioRepository/index.js

// Importar desde cada módulo
import {
  findAll,
  findById,
  create,
  update,
  deleteServicio,
} from "./crudQueries.js";
import { isActive } from "./validacionesQueries.js";

// Re-exportar
export { findAll, findById, create, update, deleteServicio, isActive };
