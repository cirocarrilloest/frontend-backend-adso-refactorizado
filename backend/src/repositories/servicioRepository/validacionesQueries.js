// backend/src/repositories/servicioRepository/validacionesQueries.js
import { getPool } from "../../config/db.js";

/**
 * VERIFICAR SI UN SERVICIO ESTÁ ACTIVO
 * @param {number} id - ID del servicio
 * @returns {Promise<boolean>} True si está activo, false en caso contrario
 *
 * Frontend:
 * - Validar servicio al agendar cita (solo mostrar activos)
 * - Verificar estado antes de asignar
 * - Componente: ServicioSelect
 *
 * Backend relacionado:
 * - clienteCitaService.agendar (validar servicio activo)
 * - adminCitaService.crearCitaAdmin (validar servicio activo)
 *
 * Ejemplo de uso:
 * const activo = await servicioRepository.isActive(1);
 * if (!activo) throw new Error("Servicio no disponible");
 */
export const isActive = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT activo FROM servicios WHERE id = ?`,
    [id],
  );
  return rows[0]?.activo === true;
};
