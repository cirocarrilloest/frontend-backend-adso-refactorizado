// backend/src/repositories/contactoRepository/consultasQueries.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER TODOS LOS MENSAJES CON PAGINACIÓN Y FILTROS
 * @param {Object} options - Opciones de filtrado
 * @param {boolean} options.soloNoLeidos - Solo no leídos
 * @param {boolean} options.soloNoRespondidos - Solo no respondidos
 * @param {string} options.search - Búsqueda por nombre, email o mensaje
 * @param {number} options.page - Número de página
 * @param {number} options.limit - Límite por página
 * @returns {Promise<Object>} Mensajes paginados
 *
 * Frontend: Panel Admin - Tabla de mensajes
 * - Componente: MensajesTable
 * - Endpoint: GET /api/contacto?soloNoLeidos=false&page=1&limit=20
 *
 * Backend relacionado: contactoController.getMensajes
 */
export const getAll = async ({
  soloNoLeidos = false,
  soloNoRespondidos = false,
  search = "",
  page = 1,
  limit = 20,
} = {}) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const offset = (page - 1) * limit;
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

  let query = "SELECT * FROM contacto_mensajes WHERE 1=1";
  const params = [];

  if (soloNoLeidos) {
    query += " AND leido = FALSE";
  }

  if (soloNoRespondidos) {
    query += " AND respondido = FALSE";
  }

  if (search && search.trim()) {
    query += " AND (nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)";
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY 
              CASE WHEN leido = FALSE THEN 0 ELSE 1 END,
              fecha DESC 
              LIMIT ${limitNum} OFFSET ${offset}`;

  const [rows] = await pool.execute(query, params);

  // Obtener total para paginación
  let countQuery = "SELECT COUNT(*) as total FROM contacto_mensajes WHERE 1=1";
  const countParams = [];

  if (soloNoLeidos) {
    countQuery += " AND leido = FALSE";
  }
  if (soloNoRespondidos) {
    countQuery += " AND respondido = FALSE";
  }
  if (search && search.trim()) {
    countQuery += " AND (nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)";
    const searchTerm = `%${search.trim()}%`;
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  const [countRows] = await pool.execute(countQuery, countParams);
  const total = countRows[0]?.total || 0;

  return {
    mensajes: rows,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * OBTENER IDs DE TODOS LOS USUARIOS ADMIN
 * @returns {Promise<Array<number>>} Lista de IDs de admins
 *
 * Frontend: Notificaciones a admins
 * Backend relacionado: contactoController.crearMensaje (para notificar a admins)
 */
export const getAdminIds = async () => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [rows] = await pool.execute(
    "SELECT id FROM usuarios WHERE rol = 'admin'",
  );
  return rows.map((r) => r.id);
};
