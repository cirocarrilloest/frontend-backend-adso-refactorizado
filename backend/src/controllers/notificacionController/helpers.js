// backend/src/controllers/notificacionController/helpers.js
import { notificacionService } from "../../services/notificacionService.js";
import { NotFoundError } from "../../utils/errors.js";

/**
 * VALIDAR Y OBTENER NOTIFICACIÓN (verificar pertenencia al usuario)
 * @param {number} id - ID de la notificación
 * @param {number} usuarioId - ID del usuario autenticado
 * @returns {Promise<Object>} Notificación encontrada
 * @throws {NotFoundError} Si no existe o no pertenece al usuario
 *
 * Frontend: Marcar notificación como leída
 * Backend relacionado: notificacionService.getById
 */
export const validarNotificacionPerteneceUsuario = async (id, usuarioId) => {
  // Necesitaríamos agregar un método getById en el servicio
  // Por ahora validamos con el método marcarLeida que ya verifica pertenencia
  const actualizado = await notificacionService.marcarLeida(id, usuarioId);
  if (!actualizado) {
    throw new NotFoundError("Notificación no encontrada");
  }
  return true;
};

/**
 * VALIDAR PARÁMETROS DE CONSULTA
 * @param {Object} query - Query params de la petición
 * @param {string} query.soloNoLeidas - Filtrar solo no leídas
 * @param {string} query.limite - Límite de resultados
 * @returns {Object} Parámetros validados
 *
 * Frontend: Filtros en lista de notificaciones
 */
export const validarParametrosConsulta = ({
  soloNoLeidas = "false",
  limite = 20,
}) => {
  return {
    soloNoLeidas: soloNoLeidas === "true",
    limite: Math.min(100, Math.max(1, parseInt(limite, 10) || 20)),
  };
};
