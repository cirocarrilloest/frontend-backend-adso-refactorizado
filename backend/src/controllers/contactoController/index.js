// backend/src/controllers/contactoController/index.js

// Importar desde cada módulo
import { enviarMensajeContacto } from "./publicoService.js";
import { getMensajesContacto, getMensajeById } from "./consultasService.js";
import {
  marcarMensajeLeido,
  marcarMensajeRespondido,
} from "./estadoService.js";
import {
  eliminarMensaje,
  eliminarMensajesMultiples,
} from "./eliminacionService.js";
import { getEstadisticasContacto } from "./estadisticasService.js";

// Re-exportar
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
