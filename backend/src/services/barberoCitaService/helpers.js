// backend/src/services/barberoCitaService/helpers.js
import { citaRepository } from "../../repositories/citaRepository.js";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../utils/errors.js";
import { fechaHoyStr } from "../../utils/dateUtils.js";

/**
 * VALIDAR PERMISO DE BARBERO
 */
export const validarPermisoBarbero = (
  barberoId,
  usuarioId,
  usuarioRol,
  accion = "realizar esta acción",
) => {
  if (usuarioRol === "barbero" && parseInt(barberoId) !== parseInt(usuarioId)) {
    throw new ForbiddenError(`No tienes permiso para ${accion}`);
  }
};

/**
 * VALIDAR Y OBTENER CITA EXISTENTE
 */
export const validarCitaExistente = async (citaId) => {
  const cita = await citaRepository.findById(citaId);
  if (!cita) {
    throw new NotFoundError("Cita");
  }
  return cita;
};

/**
 * VALIDAR QUE LA CITA PERTENEZCA AL BARBERO
 */
export const validarPerteneceBarbero = (
  cita,
  barberoId,
  accion = "modificar esta cita",
) => {
  if (cita.barbero_id !== barberoId) {
    throw new ForbiddenError(`No tienes permiso para ${accion}`);
  }
};

/**
 * VALIDAR ESTADO DE CITA PARA UNA ACCIÓN
 */
export const validarEstadoCita = (cita, estadosPermitidos, accion) => {
  if (!estadosPermitidos.includes(cita.estado)) {
    throw new BusinessRuleError(
      `No se puede ${accion} una cita en estado "${cita.estado}"`,
    );
  }
};

/**
 * CALCULAR FECHA FIN DE SEMANA
 */
export const calcularFechaFinSemana = (fechaInicio) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  return fin.toISOString().split("T")[0];
};

/**
 * AGRUPAR CITAS POR FECHA
 */
export const agruparCitasPorFecha = (citas) => {
  const agenda = {};

  for (const cita of citas) {
    // Obtener fecha en formato YYYY-MM-DD
    let fechaKey;
    if (cita.fecha instanceof Date) {
      fechaKey = cita.fecha.toISOString().split("T")[0];
    } else if (typeof cita.fecha === "string") {
      fechaKey = cita.fecha.split("T")[0];
    } else {
      fechaKey = String(cita.fecha);
    }

    if (!agenda[fechaKey]) {
      agenda[fechaKey] = [];
    }

    // Asegurar que la hora esté en formato HH:MM
    const citaFormatted = {
      ...cita,
      hora: cita.hora
        ? typeof cita.hora === "string"
          ? cita.hora.slice(0, 5)
          : String(cita.hora).slice(0, 5)
        : "00:00",
    };

    agenda[fechaKey].push(citaFormatted);
  }

  // Ordenar citas dentro de cada día por hora
  for (const fecha in agenda) {
    agenda[fecha].sort((a, b) => {
      const horaA = a.hora || "00:00";
      const horaB = b.hora || "00:00";
      return horaA.localeCompare(horaB);
    });
  }

  return agenda;
};
