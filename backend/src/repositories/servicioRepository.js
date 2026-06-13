// backend/src/repositories/servicioRepository.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  findAll,
  findById,
  create,
  update,
  deleteServicio,
} from "./servicioRepository/crudQueries.js";
import { isActive } from "./servicioRepository/validacionesQueries.js";

// RE-EXPORTAR
export const servicioRepository = {
  findAll,
  findById,
  create,
  update,
  delete: deleteServicio,
  isActive,
};

// Export default para compatibilidad
export default servicioRepository;
