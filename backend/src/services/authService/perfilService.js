// backend/src/services/authService/perfilService.js
import {
  validarYObtenerUsuario,
  validarYObtenerBarbero,
  quitarPassword,
} from "./helpers.js";

/**
 * OBTENER PERFIL DEL USUARIO AUTENTICADO
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Usuario (con contraseña incluida)
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Panel de perfil de usuario
 * - Componente: MiPerfil
 * - Endpoint: GET /api/auth/perfil
 * - Header: Authorization: Bearer <token>
 *
 * Backend relacionado: userRepository.findById
 *
 * Nota: Se retorna la contraseña porque el frontend no la muestra,
 * pero es necesaria para futuras validaciones.
 */
export const obtenerPerfil = async (userId) => {
  return await validarYObtenerUsuario(userId, "Usuario");
};

/**
 * OBTENER PERFIL PÚBLICO DE UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Object>} Barbero (sin contraseña)
 * @throws {NotFoundError} Si no existe o no es barbero
 *
 * Frontend: Página pública del barbero
 * - Componente: BarberoPerfilPublico
 * - Endpoint: GET /api/auth/barbero/:id/perfil
 *
 * Backend relacionado: userRepository.findById
 */
export const obtenerPerfilBarbero = async (barberoId) => {
  const barbero = await validarYObtenerBarbero(barberoId);
  return quitarPassword(barbero);
};
