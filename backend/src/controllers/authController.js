// backend/src/controllers/authController.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { registrarUsuario } from "./authController/registroService.js";
import {
  ingresarUsuario,
  logoutUsuario,
} from "./authController/ingresoService.js";
import {
  getPerfilUsuario,
  getPerfilBarbero,
} from "./authController/perfilService.js";
import { cambiarPassword } from "./authController/passwordService.js";

// RE-EXPORTAR
export {
  registrarUsuario,
  ingresarUsuario,
  logoutUsuario,
  getPerfilUsuario,
  cambiarPassword,
  getPerfilBarbero,
};

// Export default para compatibilidad
export default {
  registrarUsuario,
  ingresarUsuario,
  logoutUsuario,
  getPerfilUsuario,
  cambiarPassword,
  getPerfilBarbero,
};
