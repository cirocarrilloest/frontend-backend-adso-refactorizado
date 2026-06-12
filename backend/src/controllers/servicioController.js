// backend/src/controllers/servicioController.js
import { servicioRepository } from "../repositories/servicioRepository.js";
import { ok, created, notFound } from "../utils/responseUtils.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { getPool } from "../config/db.js";

export const crearServicio = async (req, res, next) => {
  try {
    const { nombre, descripcion, duracion, precio, activo } = req.body;

    if (!nombre || !duracion || !precio) {
      throw new ValidationError(
        "Faltan campos requeridos: nombre, duracion, precio",
      );
    }

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

export const getServicios = async (req, res, next) => {
  try {
    const soloActivos = req.query.activos === "true";
    const servicios = await servicioRepository.findAll(soloActivos);
    return ok(res, { servicios });
  } catch (error) {
    next(error);
  }
};

export const getServicioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicio = await servicioRepository.findById(id);
    if (!servicio) {
      throw new NotFoundError("Servicio");
    }
    return ok(res, { servicio });
  } catch (error) {
    next(error);
  }
};

export const actualizarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio, activo } = req.body;

    const servicioExistente = await servicioRepository.findById(id);
    if (!servicioExistente) {
      throw new NotFoundError("Servicio");
    }

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (duracion !== undefined) updates.duracion = duracion;
    if (precio !== undefined) updates.precio = precio;
    if (activo !== undefined) updates.activo = activo;

    const servicioActualizado = await servicioRepository.update(id, updates);

    return ok(res, {
      message: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicio = await servicioRepository.findById(id);
    if (!servicio) {
      throw new NotFoundError("Servicio");
    }

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

export const toggleActivoServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicio = await servicioRepository.findById(id);
    if (!servicio) {
      throw new NotFoundError("Servicio");
    }

    const servicioActualizado = await servicioRepository.update(id, {
      activo: !servicio.activo,
    });

    return ok(res, {
      message: `Servicio ${servicioActualizado.activo ? "activado" : "desactivado"} exitosamente`,
      servicio: servicioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

export const getBarberosPorServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicio = await servicioRepository.findById(id);
    if (!servicio || !servicio.activo) {
      throw new NotFoundError("Servicio no encontrado o inactivo");
    }

    const pool = getPool();
    const [barberos] = await pool.execute(
      `SELECT u.id, u.nombre, u.email, u.telefono,
              COUNT(c.id) as veces_realizado
       FROM usuarios u
       LEFT JOIN citas c ON u.id = c.barbero_id 
         AND c.servicio_id = ? 
         AND c.estado = 'completada'
       WHERE u.rol = 'barbero'
       GROUP BY u.id
       ORDER BY veces_realizado DESC`,
      [id],
    );

    return ok(res, {
      servicio: { id: servicio.id, nombre: servicio.nombre },
      barberos,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  crearServicio,
  getServicios,
  getServicioById,
  actualizarServicio,
  eliminarServicio,
  toggleActivoServicio,
  getBarberosPorServicio,
};
