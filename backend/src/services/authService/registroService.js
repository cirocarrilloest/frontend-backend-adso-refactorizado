// backend/src/services/authService/registroService.js
import userRepository from "../../repositories/userRepository.js";
import { ValidationError, ConflictError } from "../../utils/errors.js";
import { validarRegistro } from "../../utils/validador.js";
import { quitarPassword, validarYObtenerUsuario } from "./helpers.js";

/**
 * REGISTRAR NUEVO USUARIO (público)
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.nombre - Nombre
 * @param {string} userData.email - Email
 * @param {string} userData.pass - Contraseña
 * @param {string} userData.telefono - Teléfono (opcional)
 * @returns {Promise<Object>} Usuario registrado (sin contraseña)
 * @throws {ValidationError} Si los datos no son válidos
 * @throws {ConflictError} Si el email ya existe
 *
 * Frontend: Formulario de registro
 * - Componente: RegistroForm
 * - Endpoint: POST /api/auth/registro
 * - Body: { nombre, email, pass, telefono }
 *
 * Backend relacionado:
 * - validarRegistro (validador)
 * - userRepository.findByEmail
 * - userRepository.create
 */
export const registrar = async (userData) => {
  // 1. Validar datos de entrada
  const { error } = validarRegistro(userData);
  if (error) {
    throw new ValidationError(error.details.map((e) => e.message).join(", "));
  }

  const { nombre, email, pass, telefono } = userData;

  // 2. Verificar que el email no esté registrado
  const usuarioExistente = await userRepository.findByEmail(email);
  if (usuarioExistente) {
    throw new ConflictError("El email ya está registrado");
  }

  // 3. Crear nuevo usuario (rol cliente por defecto)
  const nuevoUsuario = await userRepository.create({
    nombre,
    email,
    pass,
    telefono,
    rol: "cliente",
  });

  // 4. Retornar usuario sin contraseña
  return { user: quitarPassword(nuevoUsuario) };
};
