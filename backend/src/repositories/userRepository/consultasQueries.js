// backend/src/repositories/userRepository/consultasQueries.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER LISTA DE USUARIOS CON FILTROS
 * @param {Object} options - Opciones de filtrado
 * @param {string} options.rol - Filtrar por rol
 * @param {string} options.search - Búsqueda por nombre/email
 * @returns {Promise<Array>} Lista de usuarios (sin contraseña)
 *
 * Frontend: Panel Admin - Tabla de usuarios
 * - Componente: UsuariosTable
 * - Endpoint: GET /api/usuarios?rol=barbero&search=juan
 *
 * Backend relacionado: userController.getUsuarios
 */
export const findAll = async ({ rol, search } = {}) => {
  const pool = await getPool();
  let query = `SELECT id, nombre, email, rol, telefono, created_at, updated_at 
               FROM usuarios WHERE 1=1`;
  const params = [];

  if (rol) {
    query += ` AND rol = ?`;
    params.push(rol);
  }
  if (search) {
    query += ` AND (nombre LIKE ? OR email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ` ORDER BY nombre`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * OBTENER LISTA DE BARBEROS
 * @returns {Promise<Array>} Lista de barberos
 *
 * Frontend:
 * - Cliente: Selector de barbero al agendar
 * - Admin: Lista de barberos
 * - Endpoint: GET /api/usuarios/barberos
 *
 * Backend relacionado: userController.getBarberos
 */
export const getBarberos = async () => {
  return findAll({ rol: "barbero" });
};
