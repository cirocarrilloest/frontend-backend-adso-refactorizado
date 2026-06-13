// backend/src/services/adminCitaService/consultasService.js
import { citaRepository } from "../../repositories/citaRepository.js";

/**
 * OBTENER TODAS LAS CITAS CON PAGINACIÓN Y FILTROS
 * @param {Object} filtros - Filtros (estado, fecha_desde, fecha_hasta)
 * @param {Object} paginacion - Paginación (page, limit)
 * @returns {Promise<Object>} Lista de citas paginada
 *
 * Frontend: Panel Admin - Tabla de todas las citas
 * - Componente: TodasCitasTable
 * - Endpoint: GET /api/citas/admin/todas?estado=pendiente&page=1&limit=15
 *
 * Backend relacionado: citaRepository.findAll
 */
export const getAllCitas = async (filtros = {}, paginacion = {}) => {
  return citaRepository.findAll(filtros, paginacion);
};

/**
 * OBTENER CITAS CERCANAS (próximas horas/días)
 * @param {number} limite - Límite de resultados (default: 5)
 * @returns {Promise<Array>} Lista de citas próximas
 *
 * Frontend: Dashboard Admin - Notificaciones de citas próximas
 * - Componente: CitasCercanasCard
 * - Endpoint: GET /api/citas/admin/cercanas
 *
 * Backend relacionado: citaRepository.getCitasCercanas
 */
export const getCitasCercanas = async (limite = 5) => {
  return citaRepository.getCitasCercanas(limite);
};
