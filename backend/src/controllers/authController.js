// src/controllers/authController.js
import * as authService from "../services/authService.js";
import { ok, created, badRequest } from "../utils/responseUtils.js";

/**
 * Controlador de autenticación - Capa de presentación
 * Responsabilidad: Validar entrada, llamar al servicio, formatear respuesta
 */

export const registrarUsuario = async (req, res, next) => {
  try {
    const result = await authService.registrar(req.body);
    return created(res, {
      message: "Usuario registrado exitosamente",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const ingresarUsuario = async (req, res, next) => {
  try {
    const { token, user } = await authService.ingresar(req.body);
    return ok(res, {
      message: "Ingreso exitoso",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUsuario = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return badRequest(res, "No se proporcionó token");
    }
    const token = authHeader.substring(7);
    await authService.logout(token);
    return ok(res, { message: "Sesión cerrada exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const getPerfilUsuario = async (req, res, next) => {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario.id);
    return ok(res, { usuario });
  } catch (error) {
    next(error);
  }
};

export const cambiarPassword = async (req, res, next) => {
  try {
    const { pass_actual, pass_nueva } = req.body;
    if (!pass_actual || !pass_nueva) {
      return badRequest(res, "Se requiere pass_actual y pass_nueva");
    }
    await authService.cambiarPassword(req.usuario.id, {
      pass_actual,
      pass_nueva,
    });
    return ok(res, { message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const getPerfilBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const perfil = await authService.obtenerPerfilBarbero(parseInt(id));
    return ok(res, { barbero: perfil });
  } catch (error) {
    next(error);
  }
};
