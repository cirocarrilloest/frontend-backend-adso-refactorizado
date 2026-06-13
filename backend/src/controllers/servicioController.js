// backend/src/controllers/servicioController.js
// Punto de entrada principal - Importa y re-exporta todos los módulos

// IMPORTAR desde los módulos
import {
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "./servicioController/crudService.js";
import {
  getServicios,
  getServicioById,
} from "./servicioController/consultasService.js";
import { toggleActivoServicio } from "./servicioController/activoService.js";
import { getBarberosPorServicio } from "./servicioController/barberosService.js";

// RE-EXPORTAR
export {
  crearServicio,
  getServicios,
  getServicioById,
  actualizarServicio,
  eliminarServicio,
  toggleActivoServicio,
  getBarberosPorServicio,
};

// Export default para compatibilidad
export default {
  crearServicio,
  getServicios,
  getServicioById,
  actualizarServicio,
  eliminarServicio,
  toggleActivoServicio,
  getBarberosPorServicio,
};
