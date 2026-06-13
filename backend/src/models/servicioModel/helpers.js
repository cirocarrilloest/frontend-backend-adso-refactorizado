// backend/src/models/servicioModel/helpers.js

/**
 * CAMPOS PERMITIDOS PARA SERVICIO
 * @constant {Array<string>}
 *
 * Frontend: Formulario de servicio (Admin)
 * Backend relacionado: Validación de campos
 */
export const CAMPOS_SERVICIO = [
  "nombre",
  "descripcion",
  "duracion",
  "precio",
  "activo",
];

/**
 * VALIDAR DATOS DE SERVICIO
 * @param {Object} data - Datos del servicio
 * @param {string} data.nombre - Nombre del servicio
 * @param {number} data.duracion - Duración en minutos
 * @param {number} data.precio - Precio del servicio
 * @throws {Error} Si faltan campos requeridos
 *
 * Frontend: Validación antes de enviar formulario
 * Backend relacionado: createServicio, updateServicio
 */
export const validarDatosServicio = ({ nombre, duracion, precio }) => {
  if (!nombre || nombre.trim() === "") {
    throw new Error("El nombre del servicio es requerido");
  }
  if (!duracion || duracion <= 0) {
    throw new Error("La duración debe ser un número positivo");
  }
  if (!precio || precio <= 0) {
    throw new Error("El precio debe ser un número positivo");
  }
  return true;
};

/**
 * PREPARAR DATOS DE SERVICIO PARA ACTUALIZACIÓN
 * @param {Object} data - Datos a actualizar
 * @returns {Object} Datos filtrados
 *
 * Frontend: Enviar solo campos modificados
 * Backend relacionado: updateServicio
 */
export const prepararDatosActualizacion = (data) => {
  const preparado = {};

  for (const campo of CAMPOS_SERVICIO) {
    if (data[campo] !== undefined) {
      preparado[campo] = data[campo];
    }
  }

  return preparado;
};

/**
 * VERIFICAR SI UN SERVICIO ESTÁ ACTIVO
 * @param {Object} servicio - Objeto servicio
 * @returns {boolean} True si está activo
 *
 * Frontend: Mostrar solo servicios activos
 * Backend relacionado: getAllServicios con filtro
 */
export const isActivo = (servicio) => {
  return servicio && servicio.activo === true;
};
