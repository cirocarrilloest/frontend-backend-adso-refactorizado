// backend/src/controllers/userController/index.js
// Este archivo importa todos los módulos y los re-exporta

// Importar desde cada módulo
import * as gestion from "./gestionModule.js";
import * as comunes from "./comunesModule.js";
import * as admin from "./adminModule.js";
import * as barbero from "./barberoModule.js";
import * as perfil from "./perfilModule.js";

// Re-exportar gestión (CRUD)
export const getUsuarios = gestion.getUsuarios;
export const createUsuario = gestion.createUsuario;
export const updateUsuario = gestion.updateUsuario;
export const deleteUsuario = gestion.deleteUsuario;

// Re-exportar comunes
export const getUsuarioById = comunes.getUsuarioById;

// Re-exportar admin
export const asignarRol = admin.asignarRol;
export const cambiarPasswordAdmin = admin.cambiarPasswordAdmin;
export const getUserCounts = admin.getUserCounts;

// Re-exportar barbero
export const getBarberos = barbero.getBarberos;
export const getBarberoPerfil = barbero.getBarberoPerfil;
export const getHorarioBarbero = barbero.getHorarioBarbero;
export const setHorarioBarbero = barbero.setHorarioBarbero;
export const deleteHorarioBarbero = barbero.deleteHorarioBarbero;

// Re-exportar perfil
export const updateMiPerfil = perfil.updateMiPerfil;
export const deleteMiCuenta = perfil.deleteMiCuenta;
