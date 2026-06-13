// backend/src/repositories/contactoRepository.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  crear,
  getById,
  eliminar,
  eliminarMultiples,
} from "./contactoRepository/crudQueries.js";
import { getAll, getAdminIds } from "./contactoRepository/consultasQueries.js";
import {
  marcarLeido,
  marcarRespondido,
} from "./contactoRepository/estadoQueries.js";
import { getEstadisticas } from "./contactoRepository/estadisticasQueries.js";

// RE-EXPORTAR
export const contactoRepository = {
  // CRUD
  crear,
  getById,
  eliminar,
  eliminarMultiples,

  // Consultas
  getAll,
  getAdminIds,

  // Estado
  marcarLeido,
  marcarRespondido,

  // Estadísticas
  getEstadisticas,
};

// Export default para compatibilidad
export default contactoRepository;
