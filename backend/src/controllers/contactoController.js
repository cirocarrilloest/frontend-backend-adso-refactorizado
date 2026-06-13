// backend/src/controllers/contactoController.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { enviarMensajeContacto } from "./contactoController/publicoService.js";
import {
  getMensajesContacto,
  getMensajeById,
} from "./contactoController/consultasService.js";
import {
  marcarMensajeLeido,
  marcarMensajeRespondido,
} from "./contactoController/estadoService.js";
import {
  eliminarMensaje,
  eliminarMensajesMultiples,
} from "./contactoController/eliminacionService.js";
import { getEstadisticasContacto } from "./contactoController/estadisticasService.js";

// RE-EXPORTAR
export {
  enviarMensajeContacto,
  getMensajesContacto,
  getMensajeById,
  marcarMensajeLeido,
  marcarMensajeRespondido,
  eliminarMensaje,
  eliminarMensajesMultiples,
  getEstadisticasContacto,
};

// Export default para compatibilidad
export default {
  enviarMensajeContacto,
  getMensajesContacto,
  getMensajeById,
  marcarMensajeLeido,
  marcarMensajeRespondido,
  eliminarMensaje,
  eliminarMensajesMultiples,
  getEstadisticasContacto,
};
