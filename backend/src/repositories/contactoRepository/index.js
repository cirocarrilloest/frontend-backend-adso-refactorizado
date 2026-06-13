// backend/src/repositories/contactoRepository/index.js

// CRUD
export { crear, getById, eliminar, eliminarMultiples } from "./crudQueries.js";

// Consultas
export { getAll, getAdminIds } from "./consultasQueries.js";

// Estado
export { marcarLeido, marcarRespondido } from "./estadoQueries.js";

// Estadísticas
export { getEstadisticas } from "./estadisticasQueries.js";
