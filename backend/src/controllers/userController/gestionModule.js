// backend/src/controllers/userController/gestionModule.js
import { userRepository } from "../../repositories/userRepository.js";
import { ok, created } from "../../utils/responseUtils.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

export const getUsuarios = async (req, res, next) => {
  try {
    const { rol, search } = req.query;
    const usuarios = await userRepository.findAll({ rol, search });
    return ok(res, { usuarios });
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
    if (rol !== undefined) updates.rol = rol;
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
