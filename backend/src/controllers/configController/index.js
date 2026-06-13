// backend/src/controllers/configController/index.js

// Importar desde cada módulo
import {
  getConfiguracion,
  getConfigByKeyController,
} from "./consultasService.js";
import { updateConfig, updateMultipleConfig } from "./actualizacionService.js";

// Re-exportar
export {
  getConfiguracion,
  getConfigByKeyController,
  updateConfig,
  updateMultipleConfig,
};
