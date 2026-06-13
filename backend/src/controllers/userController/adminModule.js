// backend/src/controllers/userController/adminModule.js
import { userRepository } from "../../repositories/userRepository.js";
import { getPool } from "../../config/db.js";
import { ok } from "../../utils/responseUtils.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

export const asignarRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const rolesPermitidos = ["admin", "barbero", "cliente"];
    if (!rolesPermitidos.includes(rol)) {
      throw new ValidationError("Rol no válido");
    }

    const usuario = await userRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError("Usuario");
    }

    const usuarioActualizado = await userRepository.update(id, { rol });

    return ok(res, {
      message: "Rol asignado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

export const cambiarPasswordAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pass } = req.body;

    if (!pass || pass.length < 6) {
      throw new ValidationError(
        "La nueva contraseña debe tener al menos 6 caracteres",
      );
    }

    const usuario = await userRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError("Usuario");
    }

    const usuarioActualizado = await userRepository.update(id, { pass });

    return ok(res, {
      message: "Contraseña actualizada exitosamente",
      usuario: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCounts = async (req, res, next) => {
  try {
    const pool = getPool();

    const [counts] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN rol = 'cliente' THEN 1 ELSE 0 END) as clientes,
        SUM(CASE WHEN rol = 'barbero' THEN 1 ELSE 0 END) as barberos,
        SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as admins
       FROM usuarios`,
    );

    return ok(res, {
      counts: {
        total: counts[0]?.total || 0,
        cliente: counts[0]?.clientes || 0,
        barbero: counts[0]?.barberos || 0,
        admin: counts[0]?.admins || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
