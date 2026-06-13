// backend/src/controllers/configController/helpers.js
import { configRepository } from "../../repositories/configRepository.js";
import { badRequest } from "../../utils/responseUtils.js";
import { ValidationError } from "../../utils/errors.js";

/**
 * VALIDAR QUE EXISTA EL CAMPO VALOR
 * @param {any} valor - Valor a validar
 * @param {Object} res - Express response
 * @returns {boolean} True si es válido
 * @throws {ValidationError} Si no existe el campo valor
 *
 * Frontend: Formulario de edición de configuración (Admin)
 * Backend relacionado: Validación antes de actualizar configuración
 */
export const validarCampoValor = (valor, res) => {
  if (valor === undefined) {
    throw new ValidationError('Se requiere el campo "valor"');
  }
  return true;
};

/**
 * VALIDAR CONFIGURACIONES PARA ACTUALIZACIÓN MÚLTIPLE
 * @param {Object} configuraciones - Objeto con configuraciones
 * @param {Object} res - Express response
 * @returns {Object} Configuraciones validadas
 * @throws {ValidationError} Si no es un objeto válido
 *
 * Frontend: Panel de configuración (Admin) - Guardar múltiples cambios
 * Backend relacionado: Validación antes de actualizar múltiples configuraciones
 */
export const validarConfiguracionesMultiples = (configuraciones, res) => {
  if (!configuraciones || typeof configuraciones !== "object") {
    throw new ValidationError(
      'Se requiere un objeto "configuraciones" con las claves y valores a actualizar',
    );
  }
  return configuraciones;
};

/**
 * VERIFICAR SI EXISTE UNA CLAVE DE CONFIGURACIÓN
 * @param {string} key - Clave de configuración
 * @param {Object} res - Express response
 * @returns {Promise<Object>} Configuración encontrada
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Obtener configuración específica (Admin)
 * Backend relacionado: configRepository.getByKey
 */
export const validarConfigExists = async (key, res) => {
  const config = await configRepository.getByKey(key);
  if (!config) {
    throw new ValidationError("Clave de configuración no encontrada");
  }
  return config;
};
