// backend/src/controllers/servicioController/crudService.js
import { servicioRepository } from "../../repositories/servicioRepository.js";
import { ok, created } from "../../utils/responseUtils.js";
import { ValidationError } from "../../utils/errors.js";
import {
  validarCamposRequeridos,
  validarServicioExistente,
  prepararActualizaciones,
} from "./helpers.js";

/**
 * CREAR NUEVO SERVICIO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Formulario crear servicio
 * - Componente: CrearServicioForm
 * - Endpoint: POST /api/servicios
 * - Body: { nombre, descripcion, duracion, precio, activo }
 *
 * Backend relacionado:
 * - validarCamposRequeridos
 * - servicioRepository.create
 */
export const crearServicio = async (req, res, next) => {
  try {
    const { nombre, descripcion, duracion, precio, activo } = req.body;

    // Validar campos requeridos
    validarCamposRequeridos({ nombre, duracion, precio });

    const nuevoServicio = await servicioRepository.create({
      nombre,
      descripcion,
      duracion,
      precio,
      activo: activo !== undefined ? activo : true,
    });

    return created(res, {
      message: "Servicio creado exitosamente",
      servicio: nuevoServicio,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ACTUALIZAR SERVICIO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Formulario editar servicio
 * - Componente: EditarServicioModal
 * - Endpoint: PUT /api/servicios/:id
 * - Body: { nombre, descripcion, duracion, precio, activo }
 *
 * Backend relacionado:
 * - validarServicioExistente
 * - prepararActualizaciones
 * - servicioRepository.update
 */
export const actualizarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio, activo } = req.body;

    // Validar que el servicio existe
    await validarServicioExistente(id);

    // Preparar actualizaciones
    const updates = prepararActualizaciones({
      nombre,
      descripcion,
      duracion,
      precio,
      activo,
    });

    const servicioActualizado = await servicioRepository.update(id, updates);

    return ok(res, {
      message: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ELIMINAR SERVICIO (admin)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next function
 * @returns {Promise<void>}
 *
 * Frontend: Panel Admin - Botón eliminar servicio
 * - Componente: EliminarServicioButton
 * - Endpoint: DELETE /api/servicios/:id
 *
 * Backend relacionado:
 * - validarServicioExistente
 * - servicioRepository.delete
 */
export const eliminarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el servicio existe
    await validarServicioExistente(id);

    const eliminado = await servicioRepository.delete(id);
    if (!eliminado) {
      throw new ValidationError(
        "No se pudo eliminar el servicio. Puede tener citas asociadas",
      );
    }

    return ok(res, { message: "Servicio eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};
