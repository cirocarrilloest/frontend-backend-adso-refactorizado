// backend/src/controllers/notificacionController/index.js

// Importar desde cada módulo
import { getMisNotificaciones, contarNoLeidas } from "./consultasService.js";
import { marcarNotificacionLeida, marcarTodasLeidas } from "./estadoService.js";

// Re-exportar
export {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  contarNoLeidas,
};
