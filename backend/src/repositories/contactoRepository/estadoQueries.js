// backend/src/repositories/contactoRepository/estadoQueries.js
import { getPool } from "../../config/db.js";

/**
 * MARCAR MENSAJE COMO LEÍDO
 * @param {number} id - ID del mensaje
 * @returns {Promise<boolean>} True si se actualizó
 *
 * Frontend: Panel Admin - Al abrir/ver mensaje
 * - Componente: MensajeDetalleModal
 * - Endpoint: PATCH /api/contacto/:id/leido
 *
 * Backend relacionado: contactoController.marcarLeido
 */
export const marcarLeido = async (id) => {
  const pool = getPool();
  const [result] = await pool.execute(
    "UPDATE contacto_mensajes SET leido = TRUE WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
};

/**
 * MARCAR MENSAJE COMO RESPONDIDO
 * @param {number} id - ID del mensaje
 * @param {string|null} respuesta - Respuesta enviada (opcional)
 * @returns {Promise<boolean>} True si se actualizó
 *
 * Frontend: Panel Admin - Botón responder mensaje
 * - Componente: ResponderMensajeModal
 * - Endpoint: PATCH /api/contacto/:id/respondido
 *
 * Backend relacionado: contactoController.marcarRespondido
 */
export const marcarRespondido = async (id, respuesta = null) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE contacto_mensajes 
     SET respondido = TRUE, 
         respuesta = ?, 
         fecha_respuesta = NOW() 
     WHERE id = ?`,
    [respuesta, id],
  );
  return result.affectedRows > 0;
};
