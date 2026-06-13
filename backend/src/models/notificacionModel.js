// backend/src/models/notificacionModel.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { crearNotificacion } from "./notificacionModel/crearModel.js";
import {
  getNotificacionesByUsuario,
  contarNoLeidas,
} from "./notificacionModel/consultasModel.js";
import {
  marcarComoLeida,
  marcarTodasComoLeidas,
} from "./notificacionModel/estadoModel.js";
import { limpiarNotificacionesAntiguas } from "./notificacionModel/limpiezaModel.js";

// RE-EXPORTAR
export {
  crearNotificacion,
  getNotificacionesByUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  contarNoLeidas,
  limpiarNotificacionesAntiguas,
};

// Export default para compatibilidad
export default {
  crearNotificacion,
  getNotificacionesByUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  contarNoLeidas,
  limpiarNotificacionesAntiguas,
};
