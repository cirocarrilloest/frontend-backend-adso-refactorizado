// backend/src/repositories/userRepository.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  findById,
  findByEmail,
  emailExists,
  create,
  update,
  deleteUser,
} from "./userRepository/crudQueries.js";
import { findAll, getBarberos } from "./userRepository/consultasQueries.js";
import {
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
} from "./userRepository/horarioQueries.js";

// RE-EXPORTAR
export const userRepository = {
  // CRUD básico
  findById,
  findByEmail,
  emailExists,
  create,
  update,
  delete: deleteUser,

  // Consultas
  findAll,
  getBarberos,

  // Horarios de barbero
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
};

// Export default para compatibilidad
export default userRepository;
