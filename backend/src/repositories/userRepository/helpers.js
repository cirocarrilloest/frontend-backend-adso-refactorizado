// backend/src/repositories/userRepository/helpers.js
import bcrypt from "bcryptjs";

/**
 * CAMPOS PERMITIDOS PARA ACTUALIZACIÓN DE USUARIO
 * @constant {Array<string>}
 *
 * Frontend: Formulario de edición de usuario (Admin/Perfil)
 * Backend relacionado: Validación de campos permitidos
 */
export const CAMPOS_PERMITIDOS = ["nombre", "email", "telefono", "rol", "pass"];

/**
 * ENCRIPTAR CONTRASEÑA CON BCRYPT
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Contraseña encriptada
 *
 * Frontend: Registro, cambio de contraseña
 * Backend relacionado: create, update
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * COMPARAR CONTRASEÑA CON VERSIÓN ENCRIPTADA
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña encriptada
 * @returns {Promise<boolean>} True si coinciden
 *
 * Frontend: Login, cambio de contraseña
 * Backend relacionado: authService
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * PREPARAR ACTUALIZACIONES PARA USUARIO
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Objeto con campos preparados
 *
 * Frontend: Enviar actualizaciones de usuario
 * Backend relacionado: update
 */
export const prepararActualizaciones = async (updates) => {
  const preparado = {};

  for (const [key, value] of Object.entries(updates)) {
    if (CAMPOS_PERMITIDOS.includes(key) && value !== undefined) {
      if (key === "pass") {
        preparado[key] = await hashPassword(value);
      } else {
        preparado[key] = value;
      }
    }
  }

  return preparado;
};

/**
 * DÍAS DE LA SEMANA EN ORDEN
 * @constant {Array<string>}
 */
export const DIAS_SEMANA_ORDEN = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

/**
 * VALIDAR HORARIO DE BARBERO
 * @param {string} hora_inicio - Hora de inicio
 * @param {string} hora_fin - Hora de fin
 * @throws {Error} Si la hora de inicio es mayor o igual a la de fin
 *
 * Frontend: Formulario de horarios (Barbero/Admin)
 * Backend relacionado: setHorarioBarbero
 */
export const validarHorarioBarbero = (hora_inicio, hora_fin) => {
  if (hora_inicio >= hora_fin) {
    throw new Error("La hora de inicio debe ser menor que la hora de fin");
  }
  return true;
};

/**
 * VALIDAR DÍA DE LA SEMANA
 * @param {string} diaSemana - Día a validar
 * @returns {boolean} True si es válido
 */
export const validarDiaSemana = (diaSemana) => {
  return DIAS_SEMANA_ORDEN.includes(diaSemana.toLowerCase());
};
