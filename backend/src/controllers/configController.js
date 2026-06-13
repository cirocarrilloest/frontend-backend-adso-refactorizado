// backend/src/controllers/configController.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  getConfiguracion,
  getConfigByKeyController,
} from "./configController/consultasService.js";
import {
  updateConfig,
  updateMultipleConfig,
} from "./configController/actualizacionService.js";

// RE-EXPORTAR
export {
  getConfiguracion,
  getConfigByKeyController,
  updateConfig,
  updateMultipleConfig,
};

// Export default para compatibilidad
export default {
  getConfiguracion,
  getConfigByKeyController,
  updateConfig,
  updateMultipleConfig,
};
