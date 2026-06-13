// backend/src/controllers/userController.js
// Punto de entrada principal - Solo re-exporta todos los módulos

export {
  // Gestión de usuarios (CRUD)
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,

  // Comunes
  getUsuarioById,

  // Administración
  asignarRol,
  cambiarPasswordAdmin,
  getUserCounts,

  // Barberos
  getBarberos,
  getBarberoPerfil,
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,

  // Perfil de usuario
  updateMiPerfil,
  deleteMiCuenta,
} from "./userController/index.js";
