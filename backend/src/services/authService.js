// src/services/authService.js
import userRepository from "../repositories/userRepository.js";
import { generarToken, invalidarToken } from "./tokenService.js";
import bcrypt from "bcryptjs";
import {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../utils/errors.js";
import { validarRegistro, validarIngreso } from "../utils/validador.js";

/**
 * Servicio de autenticación - Capa de negocio
 * Responsabilidad: Reglas de negocio relacionadas con usuarios y autenticación
 */

export const registrar = async (userData) => {
  const { error } = validarRegistro(userData);
  if (error) {
    throw new ValidationError(error.details.map((e) => e.message).join(", "));
  }

  const { nombre, email, pass, telefono } = userData;

  const usuarioExistente = await userRepository.findByEmail(email);
  if (usuarioExistente) {
    throw new ConflictError("El email ya está registrado");
  }

  const nuevoUsuario = await userRepository.create({
    nombre,
    email,
    pass,
    telefono,
    rol: "cliente",
  });

  const { pass: _, ...usuarioSinPass } = nuevoUsuario;
  return { user: usuarioSinPass };
};

export const ingresar = async ({ email, pass }) => {
  const { error } = validarIngreso({ email, pass });
  if (error) {
    throw new ValidationError(error.details.map((e) => e.message).join(", "));
  }

  const usuario = await userRepository.findByEmail(email);
  if (!usuario) {
    throw new UnauthorizedError("Credenciales inválidas");
  }

  // ✅ Usar 'pass' correctamente
  const contraseniaValida = await bcrypt.compare(pass, usuario.pass);
  if (!contraseniaValida) {
    throw new UnauthorizedError("Credenciales inválidas");
  }

  const token = generarToken(usuario.id, usuario.email, usuario.rol);

  const { pass: _, ...usuarioSinPass } = usuario;
  return { token, user: usuarioSinPass };
};

export const logout = async (token) => {
  invalidarToken(token);
};

export const cambiarPassword = async (userId, { pass_actual, pass_nueva }) => {
  if (pass_nueva.length < 6) {
    throw new ValidationError(
      "La nueva contraseña debe tener al menos 6 caracteres",
    );
  }

  const usuario = await userRepository.findById(userId);
  if (!usuario) {
    throw new NotFoundError("Usuario");
  }

  // ✅ CORREGIDO: usar 'pass' en lugar de 'password'
  const contraseniaValida = await bcrypt.compare(pass_actual, usuario.pass);
  if (!contraseniaValida) {
    throw new UnauthorizedError("La contraseña actual es incorrecta");
  }

  // ✅ Actualizar la contraseña
  await userRepository.update(userId, { pass: pass_nueva });
};

export const obtenerPerfil = async (userId) => {
  const usuario = await userRepository.findById(userId);
  if (!usuario) {
    throw new NotFoundError("Usuario");
  }
  return usuario;
};

export const obtenerPerfilBarbero = async (barberoId) => {
  const perfil = await userRepository.findById(barberoId);
  if (!perfil || perfil.rol !== "barbero") {
    throw new NotFoundError("Barbero");
  }
  return perfil;
};
