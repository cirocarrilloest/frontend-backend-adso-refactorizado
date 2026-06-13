// backend/src/controllers/servicioController/index.js

// Importar desde cada módulo
import {
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "./crudService.js";
import { getServicios, getServicioById } from "./consultasService.js";
import { toggleActivoServicio } from "./activoService.js";
import { getBarberosPorServicio } from "./barberosService.js";

// Re-exportar
export {
  crearServicio,
  getServicios,
  getServicioById,
  actualizarServicio,
  eliminarServicio,
  toggleActivoServicio,
  getBarberosPorServicio,
};
