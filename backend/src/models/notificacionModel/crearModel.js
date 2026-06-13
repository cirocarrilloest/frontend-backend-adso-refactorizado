// backend/src/models/notificacionModel/crearModel.js
import { getPool } from "../../config/db.js";
import { validarDatosNotificacion, serializarData } from "./helpers.js";

/**
 * CREAR NUEVA NOTIFICACIÓN
 * @param {number} usuarioId - ID del usuario destinatario
 * @param {string} tipo - Tipo de notificación
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje de la notificación
 * @param {any} data - Datos adicionales (opcional)
 * @returns {Promise<number>} ID de la notificación creada
 * @throws {Error} Si faltan campos requeridos
 *
 * Frontend:
 * - No se usa directamente (solo backend interno)
 * - Se usa para notificar al usuario de eventos
 *
 * Backend relacionado:
 * - notificacionService.crear (llama a esta función)
 * - clienteCitaService.agendar (notificar al barbero)
 * - barberoCitaService.confirmar (notificar al cliente)
 * - adminCitaService.crearCitaAdmin (notificar a cliente y barbero)
 *
 * Ejemplo de uso:
 * const id = await crearNotificacion(
 *   1,
 *   "cita_nueva",
 *   "Nueva cita",
 *   "Juan ha agendado una cita",
 *   { citaId: 123, cliente: "Juan" }
 * );
 */
export const crearNotificacion = async (
  usuarioId,
  tipo,
  titulo,
  mensaje,
  data = null,
) => {
  // Validar datos
  validarDatosNotificacion({ usuarioId, tipo, titulo, mensaje });

  const pool = getPool();
  const query = `
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, data, leida, creada_en)
    VALUES (?, ?, ?, ?, ?, FALSE, NOW())
  `;

  const [result] = await pool.execute(query, [
    usuarioId,
    tipo,
    titulo,
    mensaje,
    serializarData(data),
  ]);

  return result.insertId;
};
