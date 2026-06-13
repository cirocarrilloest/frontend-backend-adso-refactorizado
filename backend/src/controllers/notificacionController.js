// backend/src/controllers/notificacionController.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  getMisNotificaciones,
  contarNoLeidas,
} from "./notificacionController/consultasService.js";
import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "./notificacionController/estadoService.js";

// RE-EXPORTAR
export {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  contarNoLeidas,
};

// Export default para compatibilidad
export default {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  contarNoLeidas,
};
