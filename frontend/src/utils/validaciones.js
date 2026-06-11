// frontend/src/utils/validaciones.js
// VALIDACIONES CENTRALIZADAS - Elimina duplicación en 3+ componentes

/**
 * Valida un email
 * @param {string} email
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validarEmail = (email) => {
  if (!email || email.trim() === "") {
    return "El email es requerido";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "El email no es válido";
  }
  return null;
};

/**
 * Valida un nombre
 * @param {string} nombre
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validarNombre = (nombre) => {
  if (!nombre || nombre.trim() === "") {
    return "El nombre es requerido";
  }
  if (nombre.trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres";
  }
  if (nombre.trim().length > 100) {
    return "El nombre no puede exceder 100 caracteres";
  }
  return null;
};

/**
 * Valida una contraseña
 * @param {string} pass
 * @param {number} minLength
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validarPassword = (pass, minLength = 6) => {
  if (!pass) {
    return "La contraseña es requerida";
  }
  if (pass.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} pass
 * @param {string} confirmPass
 * @returns {string|null} Mensaje de error o null si son iguales
 */
export const validarConfirmacionPassword = (pass, confirmPass) => {
  if (pass !== confirmPass) {
    return "Las contraseñas no coinciden";
  }
  return null;
};

/**
 * Valida un teléfono
 * @param {string} telefono
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return null; // Teléfono es opcional

  const telefonoRegex = /^[0-9+\-\s()]+$/;
  if (!telefonoRegex.test(telefono)) {
    return "El teléfono contiene caracteres no válidos";
  }
  if (telefono.replace(/[\s\-\(\)\+]/g, "").length < 7) {
    return "El teléfono debe tener al menos 7 dígitos";
  }
  if (telefono.replace(/[\s\-\(\)\+]/g, "").length > 20) {
    return "El teléfono no puede exceder 20 dígitos";
  }
  return null;
};

/**
 * Valida un mensaje (para contacto)
 * @param {string} mensaje
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validarMensaje = (mensaje) => {
  if (!mensaje || mensaje.trim() === "") {
    return "El mensaje es requerido";
  }
  if (mensaje.trim().length < 10) {
    return "El mensaje debe tener al menos 10 caracteres";
  }
  if (mensaje.trim().length > 1000) {
    return "El mensaje no puede exceder 1000 caracteres";
  }
  return null;
};

/**
 * Valida un formulario completo con múltiples campos
 * @param {Object} data - Objeto con los campos a validar
 * @param {Object} rules - Objeto con las reglas de validación
 * @returns {Object} Objeto con errores por campo
 */
export const validarFormulario = (data, rules) => {
  const errors = {};

  for (const [campo, reglas] of Object.entries(rules)) {
    const valor = data[campo];

    for (const regla of reglas) {
      let error = null;

      switch (regla) {
        case "required":
          if (!valor || (typeof valor === "string" && valor.trim() === "")) {
            error = "Este campo es requerido";
          }
          break;
        case "email":
          error = validarEmail(valor);
          break;
        case "nombre":
          error = validarNombre(valor);
          break;
        case "password":
          error = validarPassword(valor);
          break;
        case "telefono":
          error = validarTelefono(valor);
          break;
        case "mensaje":
          error = validarMensaje(valor);
          break;
      }

      if (error) {
        errors[campo] = error;
        break;
      }
    }
  }

  // Validación especial para confirmación de contraseña
  if (rules.confirmarPass && data.pass && data.confirmarPass) {
    const error = validarConfirmacionPassword(data.pass, data.confirmarPass);
    if (error) errors.confirmarPass = error;
  }

  return errors;
};

/**
 * Verifica si un objeto de errores está vacío
 * @param {Object} errors
 * @returns {boolean}
 */
export const esValido = (errors) => {
  return Object.keys(errors).length === 0;
};

export default {
  validarEmail,
  validarNombre,
  validarPassword,
  validarConfirmacionPassword,
  validarTelefono,
  validarMensaje,
  validarFormulario,
  esValido,
};
