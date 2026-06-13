// backend/src/services/clienteCitaService.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { agendar } from "./clienteCitaService/agendarService.js";
import { cancelar } from "./clienteCitaService/cancelarService.js";
import { reagendar } from "./clienteCitaService/reagendarService.js";
import {
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
} from "./clienteCitaService/consultasService.js";

// RE-EXPORTAR
export {
  agendar,
  cancelar,
  reagendar,
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
};

// Export default para compatibilidad
export default {
  agendar,
  cancelar,
  reagendar,
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
};
