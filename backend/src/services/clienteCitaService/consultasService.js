// backend/src/services/clienteCitaService/consultasService.js
import { citaRepository } from "../../repositories/citaRepository.js";

/**
 * OBTENER TODAS LAS CITAS DEL CLIENTE
 * @param {number} clienteId - ID del cliente
 * @param {Object} filtros - Filtros adicionales
 * @returns {Promise<Array>} Lista de citas
 *
 * Frontend: Mis citas (lista completa)
 * - Componente: MisCitasList
 * - Endpoint: GET /api/citas/mis-citas
 *
 * Backend relacionado: citaRepository.findByClienteId
 */
export const getMisCitas = async (clienteId, filtros = {}) => {
  return citaRepository.findByClienteId(clienteId, filtros);
};

/**
 * OBTENER PRÓXIMAS CITAS DEL CLIENTE
 * @param {number} clienteId - ID del cliente
 * @returns {Promise<Array>} Lista de citas próximas
 *
 * Frontend: Dashboard cliente - Tarjetas de próximas citas
 * - Componente: ProximasCitasCard
 * - Endpoint: GET /api/citas/proximas
 *
 * Backend relacionado: citaRepository.findByClienteId con filtros específicos
 */
export const getProximasCitas = async (clienteId) => {
  return citaRepository.findByClienteId(clienteId, {
    soloFuturas: true,
    estado: "pendiente,confirmada",
    orden: "ASC",
  });
};

/**
 * OBTENER HISTORIAL DE CITAS DEL CLIENTE
 * @param {number} clienteId - ID del cliente
 * @param {number} limite - Límite de resultados (default: 10)
 * @returns {Promise<Array>} Lista de citas históricas
 *
 * Frontend: Historial de citas
 * - Componente: HistorialCitasTable
 * - Endpoint: GET /api/citas/historial?limite=10
 *
 * Backend relacionado: citaRepository.findByClienteId con orden DESC
 */
export const getHistorialCitas = async (clienteId, limite = 10) => {
  return citaRepository.findByClienteId(clienteId, {
    limite,
    orden: "DESC",
  });
};
