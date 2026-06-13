// backend/src/services/notificacionService/helpers.js

/**
 * TIPOS DE NOTIFICACIÓN VÁLIDOS
 * @constant {Array<string>}
 *
 * Frontend: Mostrar ícono/color según tipo
 * Backend relacionado: Validación al crear notificación
 */
export const TIPOS_NOTIFICACION = [
  "cita_nueva",
  "cita_confirmada",
  "cita_cancelada",
  "cita_reagendada",
  "cita_editada_admin",
  "cita_completada",
  "contacto",
  "sistema",
];

/**
 * PARSEAR DATOS DE NOTIFICACIÓN (convertir JSON string a objeto)
 * @param {string|object} data - Datos de la notificación
 * @returns {object|null} Datos parseados
 *
 * Frontend: Leer datos adicionales de la notificación
 * Backend relacionado: getByUsuario
 */
export const parsearData = (data) => {
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
};

/**
 * VALIDAR DATOS DE NOTIFICACIÓN
 * @param {Object} params - Parámetros de la notificación
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.tipo - Tipo de notificación
 * @param {string} params.titulo - Título
 * @param {string} params.mensaje - Mensaje
 * @throws {Error} Si faltan campos requeridos
 *
 * Frontend: Enviar datos para crear notificación
 * Backend relacionado: crear
 */
export const validarDatosNotificacion = ({
  usuarioId,
  tipo,
  titulo,
  mensaje,
}) => {
  if (!usuarioId) {
    throw new Error("El ID de usuario es requerido");
  }
  if (!tipo || !TIPOS_NOTIFICACION.includes(tipo)) {
    throw new Error(
      `Tipo de notificación inválido. Tipos válidos: ${TIPOS_NOTIFICACION.join(", ")}`,
    );
  }
  if (!titulo) {
    throw new Error("El título de la notificación es requerido");
  }
  if (!mensaje) {
    throw new Error("El mensaje de la notificación es requerido");
  }
  return true;
};

/**
 * VALIDAR Y NORMALIZAR LÍMITE
 * @param {number} limite - Límite de resultados
 * @returns {number} Límite normalizado (entre 1 y 100)
 *
 * Frontend: Paginación de notificaciones
 * Backend relacionado: getByUsuario
 */
export const normalizarLimite = (limite, defaultValue = 20) => {
  let limiteNumero = parseInt(limite);
  if (isNaN(limiteNumero)) {
    limiteNumero = defaultValue;
  }
  return Math.min(Math.max(limiteNumero, 1), 100);
};

/**
 * SERIALIZAR DATOS PARA ALMACENAR EN BD
 * @param {any} data - Datos a serializar
 * @returns {string|null} Datos serializados en JSON
 *
 * Frontend: Guardar datos adicionales
 * Backend relacionado: crear
 */
export const serializarData = (data) => {
  return data ? JSON.stringify(data) : null;
};
