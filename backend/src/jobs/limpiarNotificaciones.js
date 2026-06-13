// backend/src/jobs/limpiarNotificaciones.js
import cron from "node-cron";
import { limpiarNotificacionesAntiguas } from "../models/notificacionModel.js";

/**
 * JOB: Limpieza automática de notificaciones antiguas
 *
 * Frontend: No aplica (tarea de mantenimiento backend)
 * Backend relacionado:
 * - notificacionModel.limpiarNotificacionesAntiguas
 * - Se ejecuta automáticamente al iniciar la app
 *
 * Configuración:
 * - Horario: Todos los días a las 2:00 AM
 * - Mantiene: Notificaciones de los últimos 30 días
 * - Elimina: Notificaciones más antiguas
 *
 * Variables de entorno opcionales:
 * - LIMPIEZA_NOTIFICACIONES=false → Deshabilita la limpieza automática
 * - DIAS_MANTENER_NOTIFICACIONES=60 → Cambia el período de retención
 */

// Configuración desde variables de entorno
const LIMPIEZA_HABILITADA = process.env.LIMPIEZA_NOTIFICACIONES !== "false";
const DIAS_A_MANTENER =
  parseInt(process.env.DIAS_MANTENER_NOTIFICACIONES) || 30;

/**
 * Ejecutar limpieza de notificaciones antiguas
 */
const ejecutarLimpieza = async () => {
  try {
    const eliminadas = await limpiarNotificacionesAntiguas();

    if (eliminadas > 0) {
      console.log(
        `[Limpieza Notificaciones] Se eliminaron ${eliminadas} notificaciones antiguas (más de ${DIAS_A_MANTENER} días)`,
      );
    } else {
      console.log(
        `[Limpieza Notificaciones] No hay notificaciones antiguas para eliminar`,
      );
    }
  } catch (error) {
    console.error("[Limpieza Notificaciones] Error al limpiar:", error.message);
  }
};

/**
 * Iniciar job programado de limpieza de notificaciones
 */
export const iniciarLimpiezaNotificaciones = () => {
  // Verificar si está habilitado
  if (!LIMPIEZA_HABILITADA) {
    console.log(
      "Limpieza automática de notificaciones deshabilitada por configuración",
    );
    return;
  }

  // Programar la tarea para todos los días a las 2:00 AM
  cron.schedule("0 2 * * *", ejecutarLimpieza);

  console.log(`Job de limpieza de notificaciones programado (02:00 AM diario)`);
  console.log(
    `   Se mantendrán notificaciones de los últimos ${DIAS_A_MANTENER} días`,
  );
};

/**
 * Ejecutar limpieza manualmente (para pruebas o mantenimiento)
 */
export const ejecutarLimpiezaManual = async () => {
  console.log("[Manual] Ejecutando limpieza manual de notificaciones...");
  await ejecutarLimpieza();
};
