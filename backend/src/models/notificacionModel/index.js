// backend/src/models/notificacionModel/index.js

// Importar desde cada módulo
import { crearNotificacion } from "./crearModel.js";
import {
  getNotificacionesByUsuario,
  contarNoLeidas,
} from "./consultasModel.js";
import { marcarComoLeida, marcarTodasComoLeidas } from "./estadoModel.js";
import { limpiarNotificacionesAntiguas } from "./limpiezaModel.js";

// Re-exportar
export {
  crearNotificacion,
  getNotificacionesByUsuario,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  limpiarNotificacionesAntiguas,
};
