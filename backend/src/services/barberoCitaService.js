// backend/src/services/barberoCitaService.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  getAgendaDia,
  getAgendaSemana,
} from "./barberoCitaService/agendaService.js";
import { confirmar } from "./barberoCitaService/confirmarService.js";
import { finalizar } from "./barberoCitaService/finalizarService.js";
import { getResumenCitas } from "./barberoCitaService/resumenService.js";
import { getHorariosDisponibles } from "./barberoCitaService/disponibilidadService.js";

// RE-EXPORTAR
export {
  getAgendaDia,
  getAgendaSemana,
  confirmar,
  finalizar,
  getResumenCitas,
  getHorariosDisponibles,
};

// Export default para compatibilidad
export default {
  getAgendaDia,
  getAgendaSemana,
  confirmar,
  finalizar,
  getResumenCitas,
  getHorariosDisponibles,
};
