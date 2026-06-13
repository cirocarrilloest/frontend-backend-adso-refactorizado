// backend/src/services/authService.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import { registrar } from "./authService/registroService.js";
import { ingresar, logout } from "./authService/ingresoService.js";
import { cambiarPassword } from "./authService/passwordService.js";
import {
  obtenerPerfil,
  obtenerPerfilBarbero,
} from "./authService/perfilService.js";

// RE-EXPORTAR
export {
  registrar,
  ingresar,
  logout,
  cambiarPassword,
  obtenerPerfil,
  obtenerPerfilBarbero,
};

// Export default para compatibilidad
export default {
  registrar,
  ingresar,
  logout,
  cambiarPassword,
  obtenerPerfil,
  obtenerPerfilBarbero,
};
