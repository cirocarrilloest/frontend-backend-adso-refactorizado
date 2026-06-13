// backend/src/repositories/userRepository/crudQueries.js
import { getPool } from "../../config/db.js";
import { prepararActualizaciones, hashPassword } from "./helpers.js";

/**
 * BUSCAR USUARIO POR EMAIL
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 *
 * Frontend: Login, verificación de email
 * Backend relacionado: authService.ingresar
 *
 * Ejemplo de respuesta:
 * { id: 1, nombre: "Juan", email: "juan@test.com", pass: "hash", rol: "cliente", ... }
 */
export const findByEmail = async (email) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [rows] = await pool.execute(
    `SELECT id, nombre, email, pass, rol, telefono, created_at, updated_at
     FROM usuarios WHERE email = ?`,
    [email],
  );
  return rows[0] || null;
};

/**
 * BUSCAR USUARIO POR ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 *
 * Frontend:
 * - Perfil de usuario
 * - Verificación de permisos
 * - Endpoint: GET /api/usuarios/:id
 *
 * Backend relacionado: userController.getUsuarioById
 */
export const findById = async (id) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [rows] = await pool.execute(
    `SELECT id, nombre, email, pass, rol, telefono, created_at, updated_at
     FROM usuarios WHERE id = ?`,
    [id],
  );
  return rows[0] || null;
};

/**
 * VERIFICAR SI EXISTE UN EMAIL
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} True si existe
 *
 * Frontend: Validación en registro (evitar duplicados)
 * Backend relacionado: authService.registrar, userController.createUsuario
 */
export const emailExists = async (email) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [rows] = await pool.execute("SELECT id FROM usuarios WHERE email = ?", [
    email,
  ]);
  return rows.length > 0;
};

/**
 * CREAR NUEVO USUARIO
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.nombre - Nombre
 * @param {string} userData.email - Email
 * @param {string} userData.pass - Contraseña
 * @param {string} userData.rol - Rol (cliente/barbero/admin)
 * @param {string} userData.telefono - Teléfono (opcional)
 * @returns {Promise<Object>} Usuario creado (sin contraseña)
 *
 * Frontend:
 * - Registro de usuario (público)
 * - Admin: Crear usuario
 * - Endpoint: POST /api/auth/registro, POST /api/usuarios
 *
 * Backend relacionado: authService.registrar, userController.createUsuario
 */
export const create = async (userData) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const { nombre, email, pass, rol = "cliente", telefono = null } = userData;
  const hashedPassword = await hashPassword(pass);

  const [result] = await pool.execute(
    `INSERT INTO usuarios (nombre, email, pass, rol, telefono) 
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, email, hashedPassword, rol, telefono],
  );
  return findById(result.insertId);
};

/**
 * ACTUALIZAR USUARIO
 * @param {number} id - ID del usuario
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Usuario actualizado
 *
 * Frontend:
 * - Editar perfil propio
 * - Admin: Editar cualquier usuario
 * - Endpoint: PUT /api/usuarios/:id, PUT /api/usuarios/perfil
 *
 * Backend relacionado: userController.updateUsuario, userController.updateMiPerfil
 */
export const update = async (id, updates) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await

  // Preparar solo los campos válidos y encriptar contraseña si es necesario
  const actualizaciones = await prepararActualizaciones(updates);

  if (Object.keys(actualizaciones).length === 0) {
    return findById(id);
  }

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(actualizaciones)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE usuarios SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
    values,
  );

  return findById(id);
};

/**
 * ELIMINAR USUARIO
 * @param {number} id - ID del usuario
 * @returns {Promise<boolean>} True si se eliminó
 *
 * Frontend:
 * - Admin: Eliminar usuario
 * - Usuario: Eliminar su propia cuenta
 * - Endpoint: DELETE /api/usuarios/:id, DELETE /api/usuarios/perfil
 *
 * Backend relacionado: userController.deleteUsuario, userController.deleteMiCuenta
 */
export const deleteUser = async (id) => {
  const pool = await getPool(); // ✅ CORREGIDO: añadido await
  const [result] = await pool.execute("DELETE FROM usuarios WHERE id = ?", [
    id,
  ]);
  return result.affectedRows > 0;
};
