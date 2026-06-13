// backend/src/controllers/authController/index.js

// Importar desde cada módulo
import { registrarUsuario } from "./registroService.js";
import { ingresarUsuario, logoutUsuario } from "./ingresoService.js";
import { getPerfilUsuario, getPerfilBarbero } from "./perfilService.js";
import { cambiarPassword } from "./passwordService.js";

// Re-exportar
export {
  registrarUsuario,
  ingresarUsuario,
  logoutUsuario,
  getPerfilUsuario,
  cambiarPassword,
  getPerfilBarbero,
};
