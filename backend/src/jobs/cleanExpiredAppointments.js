// backend/src/jobs/cleanExpiredAppointments.js
import { getPool } from "../config/db.js";

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
const getFechaHoy = () => {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
};

/**
 * Obtiene la hora actual en formato HH:MM:SS (para comparar con TIME en MySQL)
 */
const getHoraActualMySQL = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
};

/**
 * Convierte citas pendientes o confirmadas a canceladas cuando la fecha ya pasó
 * Este job se ejecuta automáticamente cada hora
 */
export const cleanExpiredAppointments = async () => {
  const pool = getPool();
  const hoy = getFechaHoy();
  const horaActual = getHoraActualMySQL();

  try {
    // 1. Cancelar citas de fechas pasadas (anteriores a hoy)
    const [resultFechas] = await pool.execute(
      `UPDATE citas 
       SET estado = 'cancelada', 
           notas = CONCAT(COALESCE(notas, ''), ' [Auto-cancelada: fecha vencida el ', ?, ']')
       WHERE estado IN ('pendiente', 'confirmada') 
         AND fecha < ?`,
      [hoy, hoy],
    );

    // 2. Cancelar citas del día actual pero con hora ya pasada
    const [resultHoras] = await pool.execute(
      `UPDATE citas 
       SET estado = 'cancelada',
           notas = CONCAT(COALESCE(notas, ''), ' [Auto-cancelada: hora vencida a las ', ?, ']')
       WHERE estado IN ('pendiente', 'confirmada')
         AND fecha = ?
         AND hora < ?`,
      [horaActual.slice(0, 5), hoy, horaActual],
    );

    const total = resultFechas.affectedRows + resultHoras.affectedRows;

    if (total > 0) {
      console.log(
        `${total} cita(s) vencida(s) fueron canceladas automáticamente`,
      );
      console.log(`   - Fechas pasadas: ${resultFechas.affectedRows}`);
      console.log(`   - Horas pasadas hoy: ${resultHoras.affectedRows}`);
    }

    return {
      canceladas: total,
      fechas: resultFechas.affectedRows,
      horas: resultHoras.affectedRows,
    };
  } catch (error) {
    console.error("Error al limpiar citas vencidas:", error.message);
    return { error: error.message };
  }
};

/**
 * Inicia el job programado que limpia citas vencidas
 */
export const startExpiredAppointmentsJob = () => {
  console.log("Iniciando job de limpieza de citas vencidas...");

  // Esperar 5 segundos para que la BD esté lista y ejecutar
  setTimeout(() => {
    cleanExpiredAppointments();
  }, 5000);

  // Ejecutar cada 1 hora (3600000 ms)
  const hourlyInterval = setInterval(cleanExpiredAppointments, 60 * 60 * 1000);

  // Calcular tiempo hasta la medianoche
  const ahora = new Date();
  const msHastaMedianoche =
    (24 - ahora.getHours()) * 60 * 60 * 1000 -
    ahora.getMinutes() * 60 * 1000 -
    ahora.getSeconds() * 1000;

  const midnightTimeout = setTimeout(() => {
    cleanExpiredAppointments();
    // Después de la medianoche, seguir ejecutando cada 24 horas
    setInterval(cleanExpiredAppointments, 24 * 60 * 60 * 1000);
  }, msHastaMedianoche);

  // Retornar función para limpiar los intervalos si es necesario
  return () => {
    clearInterval(hourlyInterval);
    clearTimeout(midnightTimeout);
  };
};

export default { cleanExpiredAppointments, startExpiredAppointmentsJob };
