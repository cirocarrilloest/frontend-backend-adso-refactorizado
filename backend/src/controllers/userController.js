// backend/src/controllers/userController.js
import { userRepository } from "../repositories/userRepository.js";
import { getPool } from "../config/db.js";
import { ok, created, badRequest, notFound } from "../utils/responseUtils.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

/**
 * Controlador de usuarios - Capa de presentación
 */

export const getUsuarios = async (req, res, next) => {
  try {
    const { rol, search } = req.query;
    const usuarios = await userRepository.findAll({ rol, search });
    return ok(res, { usuarios });
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await userRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError("Usuario");
    }
    return ok(res, { usuario });
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (req, res, next) => {
  try {
    const { nombre, email, pass, rol, telefono } = req.body;

    if (!nombre || !email || !pass) {
      throw new ValidationError("Nombre, email y contraseña son requeridos");
    }

    const existe = await userRepository.emailExists(email);
    if (existe) {
      throw new ValidationError("El email ya está registrado");
    }

    const nuevoUsuario = await userRepository.create({
      nombre,
      email,
      pass,
      rol: rol || "cliente",
      telefono,
    });

    return created(res, {
      message: "Usuario creado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, telefono, pass } = req.body;

    console.log("📝 Actualizando usuario:", {
      id,
      nombre,
      email,
      rol,
      telefono,
    });

    const usuarioExistente = await userRepository.findById(id);
    if (!usuarioExistente) {
      throw new NotFoundError("Usuario");
    }

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (email !== undefined) updates.email = email;
    if (rol !== undefined) updates.rol = rol; // ✅ Asegurar que rol se incluya
    if (telefono !== undefined) updates.telefono = telefono;
    if (pass !== undefined) updates.pass = pass;

    const usuarioActualizado = await userRepository.update(id, updates);

    console.log("✅ Usuario actualizado:", usuarioActualizado);

    return ok(res, {
      message: "Usuario actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await userRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError("Usuario");
    }

    await userRepository.delete(id);
    return ok(res, { message: "Usuario eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};

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

export const getBarberos = async (req, res, next) => {
  try {
    const barberos = await userRepository.getBarberos();
    return ok(res, { barberos });
  } catch (error) {
    next(error);
  }
};

export const getHorarioBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const horarios = await userRepository.getHorarioBarbero(id);
    return ok(res, { horarios });
  } catch (error) {
    next(error);
  }
};

export const setHorarioBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dia_semana, hora_inicio, hora_fin } = req.body;

    const horario = await userRepository.setHorarioBarbero(id, {
      dia_semana,
      hora_inicio,
      hora_fin,
    });

    return ok(res, { message: "Horario configurado exitosamente", horario });
  } catch (error) {
    next(error);
  }
};

export const deleteHorarioBarbero = async (req, res, next) => {
  try {
    const { id, dia } = req.params;
    await userRepository.deleteHorarioBarbero(id, dia);
    return ok(res, { message: "Horario eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const updateMiPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, email, telefono, pass } = req.body;

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (email) updates.email = email;
    if (telefono !== undefined) updates.telefono = telefono;
    if (pass) updates.pass = pass;

    const usuarioActualizado = await userRepository.update(usuarioId, updates);

    return ok(res, {
      message: "Perfil actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMiCuenta = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    // Verificar si tiene citas pendientes
    const pool = getPool();
    const [citas] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE cliente_id = ? AND estado IN ('pendiente', 'confirmada')`,
      [usuarioId],
    );

    if (citas[0].total > 0) {
      throw new ValidationError(
        `No puedes eliminar tu cuenta porque tienes ${citas[0].total} cita(s) pendiente(s)`,
      );
    }

    await userRepository.delete(usuarioId);
    return ok(res, { message: "Cuenta eliminada exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const getBarberoPerfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const barbero = await userRepository.findById(id);

    if (!barbero) {
      throw new NotFoundError("Barbero no encontrado");
    }

    if (barbero.rol !== "barbero") {
      return res.status(400).json({
        success: false,
        mensaje: "El usuario no es un barbero",
      });
    }

    // Obtener horarios del barbero
    const horarios = await userRepository.getHorarioBarbero(id);

    return ok(res, {
      barbero: {
        id: barbero.id,
        nombre: barbero.nombre,
        email: barbero.email,
        telefono: barbero.telefono,
        rol: barbero.rol,
      },
      horarios,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener contadores de usuarios por rol
 * GET /api/usuarios/counts
 */
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

export default {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  asignarRol,
  cambiarPasswordAdmin,
  getBarberos,
  getBarberoPerfil,
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
  updateMiPerfil,
  deleteMiCuenta,
  getUserCounts, // ← AGREGADA
};
