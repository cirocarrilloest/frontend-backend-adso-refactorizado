// src/utils/dateUtils.js

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD usando hora local del servidor.
 * Centralizado para evitar la misma lógica repetida en 5+ lugares.
 */
export const fechaHoyStr = () => {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Retorna la hora actual en formato HH:MM.
 */
export const horaActualStr = () => {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
};

/**
 * Valida que la combinación fecha+hora no esté en el pasado.
 * Retorna null si está bien, o { ok: false, message } si está en el pasado.
 *
 * Era copiada literalmente en:
 *   - citaController.js (agendarCita, reagendarCita, crearCitaAdmin, editarCitaAdmin)
 *   - dateValidationMiddleware.js (validarFechaNoPasada)
 */
export const validarFechaHoraFutura = (fecha, hora) => {
  const hoy = fechaHoyStr();

  if (fecha < hoy) {
    return {
      ok: false,
      message: `No se puede agendar en una fecha pasada (${fecha})`,
    };
  }

  if (fecha === hoy && hora) {
    const horaActual = horaActualStr();
    const horaNorm = String(hora).slice(0, 5);
    if (horaNorm <= horaActual) {
      return {
        ok: false,
        message: `No se puede agendar a una hora que ya pasó. Hora actual: ${horaActual}`,
      };
    }
  }

  return null;
};

/**
 * Normaliza una fecha ISO que puede venir con zona horaria (ej: "2026-06-11T00:00:00Z")
 * al formato YYYY-MM-DD.
 */
export const normalizarFecha = (fecha) => {
  if (!fecha) return fecha;
  return String(fecha).includes("T") ? String(fecha).split("T")[0] : fecha;
};

/**
 * Obtiene el nombre del día de la semana en español a partir de YYYY-MM-DD.
 * Parseado sin zona horaria para evitar el bug clásico de Date("2026-06-11") → día anterior.
 */
export const getDiaSemana = (fecha) => {
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const [anio, mes, dia] = String(fecha).split("-").map(Number);
  const fechaObj = new Date(anio, mes - 1, dia);
  return diasSemana[fechaObj.getDay()];
};
