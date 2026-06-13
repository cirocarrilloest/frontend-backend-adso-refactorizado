// backend/src/services/notificacionService/index.js

// Importar desde cada módulo
import { crear } from "./crearService.js";
import { getByUsuario, contarNoLeidas } from "./consultasService.js";
import { marcarLeida, marcarTodasLeidas } from "./estadoService.js";

// Re-exportar
export { crear, getByUsuario, contarNoLeidas, marcarLeida, marcarTodasLeidas };
