// backend/src/services/notificacionService.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { crear } from "./notificacionService/crearService.js";
import {
  getByUsuario,
  contarNoLeidas,
} from "./notificacionService/consultasService.js";
import {
  marcarLeida,
  marcarTodasLeidas,
} from "./notificacionService/estadoService.js";

// RE-EXPORTAR
export const notificacionService = {
  crear,
  getByUsuario,
  marcarLeida,
  marcarTodasLeidas,
  contarNoLeidas,
};

// Export default para compatibilidad
export default notificacionService;
