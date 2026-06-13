// backend/src/services/notificacionService/crearService.js
import { getPool } from "../../config/db.js";
import { validarDatosNotificacion, serializarData } from "./helpers.js";

/**
 * CREAR NUEVA NOTIFICACIÓN
 * @param {Object} params - Parámetros de la notificación
 * @param {number} params.usuarioId - ID del usuario destinatario
 * @param {string} params.tipo - Tipo de notificación (cita_nueva, cita_confirmada, etc.)
 * @param {string} params.titulo - Título de la notificación
 * @param {string} params.mensaje - Mensaje de la notificación
 * @param {any} params.data - Datos adicionales (opcional)
 * @returns {Promise<number>} ID de la notificación creada
 * @throws {Error} Si faltan campos requeridos
 *
 * Frontend:
 * - No se usa directamente (backend interno)
 * - Se usa para notificar al usuario de eventos
 *
 * Backend relacionado:
 * - clienteCitaService.agendar (notificar al barbero)
 * - barberoCitaService.confirmar (notificar al cliente)
 * - adminCitaService.crearCitaAdmin (notificar a cliente y barbero)
 * - contactoController (notificar a admins)
 *
 * Tipos de notificación y su uso:
 * - "cita_nueva": Cuando se agenda una cita
 * - "cita_confirmada": Cuando el barbero confirma
 * - "cita_cancelada": Cuando se cancela una cita
 * - "cita_reagendada": Cuando se reagenda
 * - "cita_editada_admin": Cuando admin edita
 * - "cita_completada": Cuando se completa el servicio
 * - "contacto": Nuevo mensaje de contacto
 * - "sistema": Notificaciones generales
 */
export const crear = async ({
  usuarioId,
  tipo,
  titulo,
  mensaje,
  data = null,
}) => {
  // 1. Validar datos
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
