// backend/src/repositories/servicioRepository/helpers.js

/**
 * CAMPOS PERMITIDOS PARA ACTUALIZACIÓN DE SERVICIO
 * @constant {Array<string>}
 *
 * Frontend: Formulario de edición de servicio (Admin)
 * Backend relacionado: Validación de campos permitidos
 */
export const CAMPOS_PERMITIDOS = [
  "nombre",
  "descripcion",
  "duracion",
  "precio",
  "activo",
];

/**
 * PREPARAR ACTUALIZACIONES PARA SERVICIO
 * @param {Object} updates - Objeto con campos a actualizar
 * @returns {Object} Objeto con solo los campos válidos
 *
 * Frontend: Enviar actualizaciones de servicio
 * Backend relacionado: servicioRepository.update
 *
 * Ejemplo:
 * inputs: { nombre: "Corte", extra: "campo_invalido", precio: 5000 }
 * output: { nombre: "Corte", precio: 5000 }
 */
export const prepararActualizaciones = (updates) => {
  const preparado = {};

  for (const [key, value] of Object.entries(updates)) {
    if (CAMPOS_PERMITIDOS.includes(key) && value !== undefined) {
      preparado[key] = value;
    }
  }

  return preparado;
};

/**
 * VALIDAR QUE TENGAN CAMPOS PARA ACTUALIZAR
 * @param {Object} updates - Objeto con actualizaciones
 * @returns {boolean} True si hay al menos un campo
 */
export const tieneCamposParaActualizar = (updates) => {
  return Object.keys(updates).length > 0;
};
