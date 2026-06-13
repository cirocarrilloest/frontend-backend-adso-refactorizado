// backend/src/services/barberoCitaService/disponibilidadService.js
import { citaRepository } from "../../repositories/citaRepository.js";
import { fechaHoyStr } from "../../utils/dateUtils.js";

/**
 * OBTENER HORARIOS DISPONIBLES DE UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @param {string} fecha - Fecha (YYYY-MM-DD)
 * @param {number} duracionSlot - Duración del slot en minutos (default: 30)
 * @returns {Promise<Object>} Lista de horarios disponibles
 *
 * Frontend: Selector de horarios al agendar cita
 * - Componente: HorariosDisponiblesList
 * - Endpoint: GET /api/horarios/disponibles/:barberoId?fecha=YYYY-MM-DD
 *
 * Backend relacionado:
 * - citaRepository.getHorarioByDay
 * - citaRepository.getHorariosOcupados
 */
export const getHorariosDisponibles = async (
  barberoId,
  fecha,
  duracionSlot = 30,
) => {
  // 1. Obtener horario laboral del barbero
  const horario = await citaRepository.getHorarioByDay(barberoId, fecha);

  if (!horario) {
    return {
      horarios: [],
      mensaje: "El barbero no tiene horario configurado para este día",
    };
  }

  // 2. Generar slots según duración
  const slots = [];
  let [horaInicio, minInicio] = horario.hora_inicio.split(":").map(Number);
  let [horaFin, minFin] = horario.hora_fin.split(":").map(Number);

  let minutosActual = horaInicio * 60 + minInicio;
  const minutosFin = horaFin * 60 + minFin;

  while (minutosActual < minutosFin) {
    const hora = Math.floor(minutosActual / 60);
    const min = minutosActual % 60;
    slots.push(
      `${String(hora).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
    );
    minutosActual += duracionSlot;
  }

  // 3. Obtener horarios ocupados
  const ocupados = await citaRepository.getHorariosOcupados(barberoId, fecha);
  const ocupadosSet = new Set(ocupados.map((h) => String(h).slice(0, 5)));

  // 4. Filtrar slots ocupados
  let disponibles = slots.filter((slot) => !ocupadosSet.has(slot));

  // 5. Si es hoy, filtrar horas pasadas
  const hoy = fechaHoyStr();
  if (fecha === hoy) {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    disponibles = disponibles.filter((slot) => slot > horaActual);
  }

  return {
    horarios: disponibles,
    barbero: { id: barberoId },
  };
};
