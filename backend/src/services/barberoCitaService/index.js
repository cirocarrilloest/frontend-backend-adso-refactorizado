// backend/src/services/barberoCitaService/index.js

// Importar desde cada módulo
import { getAgendaDia, getAgendaSemana } from "./agendaService.js";
import { confirmar } from "./confirmarService.js";
import { finalizar } from "./finalizarService.js";
import { getResumenCitas } from "./resumenService.js";
import { getHorariosDisponibles } from "./disponibilidadService.js";

// Re-exportar
export {
  getAgendaDia,
  getAgendaSemana,
  confirmar,
  finalizar,
  getResumenCitas,
  getHorariosDisponibles,
};
