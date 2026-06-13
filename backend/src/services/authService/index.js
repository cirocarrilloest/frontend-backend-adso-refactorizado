// backend/src/services/authService/index.js

// Importar desde cada módulo
import { registrar } from "./registroService.js";
import { ingresar, logout } from "./ingresoService.js";
import { cambiarPassword } from "./passwordService.js";
import { obtenerPerfil, obtenerPerfilBarbero } from "./perfilService.js";

// Re-exportar
export {
  registrar,
  ingresar,
  logout,
  cambiarPassword,
  obtenerPerfil,
  obtenerPerfilBarbero,
};
