// backend/src/repositories/configRepository.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  getAll,
  getByKey,
  set,
  setMany,
} from "./configRepository/crudQueries.js";

// RE-EXPORTAR
export const configRepository = {
  getAll,
  getByKey,
  set,
  setMany,
};

// Export default para compatibilidad
export default configRepository;
