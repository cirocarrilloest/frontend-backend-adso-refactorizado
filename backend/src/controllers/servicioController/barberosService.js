// backend/src/controllers/servicioController/barberosService.js
import { ok } from "../../utils/responseUtils.js";
import { getPool } from "../../config/db.js";
import { validarServicioActivo } from "./helpers.js";

/**
 * OBTENER BARBEROS QUE REALIZAN UN SERVICIO (público + admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend:
 * - Cliente: Ver qué barberos realizan un servicio
 * - Admin: Estadísticas por servicio
 * - Endpoint: GET /api/servicios/:id/barberos
 *
 * Backend relacionado:
 * - validarServicioActivo
 * - Pool connection (consulta directa)
 * - Tablas: usuarios, citas
 */
export const getBarberosPorServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el servicio existe y está activo
    const servicio = await validarServicioActivo(id);

    const pool = getPool();
    const [barberos] = await pool.execute(
      `SELECT u.id, u.nombre, u.email, u.telefono,
              COUNT(c.id) as veces_realizado
       FROM usuarios u
       LEFT JOIN citas c ON u.id = c.barbero_id 
         AND c.servicio_id = ? 
         AND c.estado = 'completada'
       WHERE u.rol = 'barbero'
       GROUP BY u.id
       ORDER BY veces_realizado DESC`,
      [id],
    );

    return ok(res, {
      servicio: { id: servicio.id, nombre: servicio.nombre },
      barberos,
    });
  } catch (error) {
    next(error);
  }
};
