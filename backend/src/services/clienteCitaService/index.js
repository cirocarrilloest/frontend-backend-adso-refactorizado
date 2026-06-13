// backend/src/services/clienteCitaService/index.js

// Importar desde cada módulo
import { agendar } from "./agendarService.js";
import { cancelar } from "./cancelarService.js";
import { reagendar } from "./reagendarService.js";
import {
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
} from "./consultasService.js";

// Re-exportar
export {
  agendar,
  cancelar,
  reagendar,
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
};
