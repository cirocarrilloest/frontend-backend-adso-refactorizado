// backend/src/repositories/userRepository/index.js

// Importar desde cada módulo
import {
  findById,
  findByEmail,
  emailExists,
  create,
  update,
  deleteUser,
} from "./crudQueries.js";
import { findAll, getBarberos } from "./consultasQueries.js";
import {
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
} from "./horarioQueries.js";

// Re-exportar
export {
  findById,
  findByEmail,
  emailExists,
  create,
  update,
  deleteUser,
  findAll,
  getBarberos,
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
};
