// backend/src/controllers/servicioController/helpers.js
import { servicioRepository } from "../../repositories/servicioRepository.js";
import { ValidationError, NotFoundError } from "../../utils/errors.js";

/**
 * VALIDAR CAMPOS REQUERIDOS PARA CREAR/ACTUALIZAR SERVICIO
 * @param {Object} body - Cuerpo de la petición
 * @param {string} body.nombre - Nombre del servicio
 * @param {number} body.duracion - Duración en minutos
 * @param {number} body.precio - Precio del servicio
 * @throws {ValidationError} Si faltan campos requeridos
 *
 * Frontend: Formulario de servicio (Admin)
 * Backend relacionado: Validación antes de crear/actualizar
 */
export const validarCamposRequeridos = ({ nombre, duracion, precio }) => {
  if (!nombre || !duracion || !precio) {
    throw new ValidationError(
      "Faltan campos requeridos: nombre, duracion, precio",
    );
  }
};

/**
 * VALIDAR Y OBTENER SERVICIO EXISTENTE
 * @param {number} id - ID del servicio
 * @returns {Promise<Object>} Servicio encontrado
 * @throws {NotFoundError} Si no existe
 *
 * Frontend: Editar, eliminar, toggle activo
 * Backend relacionado: servicioRepository.findById
 */
export const validarServicioExistente = async (id) => {
  const servicio = await servicioRepository.findById(id);
  if (!servicio) {
    throw new NotFoundError("Servicio");
  }
  return servicio;
};

/**
 * VALIDAR Y OBTENER SERVICIO ACTIVO EXISTENTE
 * @param {number} id - ID del servicio
 * @returns {Promise<Object>} Servicio activo encontrado
 * @throws {NotFoundError} Si no existe o no está activo
 *
 * Frontend: Ver barberos por servicio (solo servicios activos)
 * Backend relacionado: servicioRepository.findById
 */
export const validarServicioActivo = async (id) => {
  const servicio = await servicioRepository.findById(id);
  if (!servicio || !servicio.activo) {
    throw new NotFoundError("Servicio no encontrado o inactivo");
  }
  return servicio;
};

/**
 * PREPARAR ACTUALIZACIONES PARA SERVICIO
 * @param {Object} body - Cuerpo de la petición
 * @returns {Object} Objeto con solo los campos a actualizar
 *
 * Frontend: Formulario de edición (Admin)
 * Backend relacionado: servicioRepository.update
 */
export const prepararActualizaciones = ({
  nombre,
  descripcion,
  duracion,
  precio,
  activo,
}) => {
  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (descripcion !== undefined) updates.descripcion = descripcion;
  if (duracion !== undefined) updates.duracion = duracion;
  if (precio !== undefined) updates.precio = precio;
  if (activo !== undefined) updates.activo = activo;
  return updates;
};
