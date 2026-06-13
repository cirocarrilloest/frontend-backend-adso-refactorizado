// backend/src/models/notificacionModel/helpers.js

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
 * Backend relacionado: getNotificacionesByUsuario
 */
export const parsearData = (data) => {
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
};

/**
 * SERIALIZAR DATOS PARA ALMACENAR EN BD
 * @param {any} data - Datos a serializar
 * @returns {string|null} Datos serializados en JSON
 *
 * Frontend: Guardar datos adicionales
 * Backend relacionado: crearNotificacion
 */
export const serializarData = (data) => {
  if (!data) return null;
  return typeof data === "string" ? data : JSON.stringify(data);
};

/**
 * VALIDAR Y NORMALIZAR LÍMITE PARA CONSULTAS
 * @param {number} limite - Límite de resultados
 * @param {number} maximo - Límite máximo (default: 100)
 * @param {number} defecto - Valor por defecto (default: 20)
 * @returns {number} Límite normalizado
 *
 * Frontend: Paginación de notificaciones
 * Backend relacionado: getNotificacionesByUsuario
 */
export const normalizarLimite = (limite, maximo = 100, defecto = 20) => {
  let limiteNumero = parseInt(limite, 10);

  // Si no es un número válido, usar valor por defecto
  if (isNaN(limiteNumero) || limiteNumero <= 0) {
    limiteNumero = defecto;
  }

  // Limitar a máximo permitido
  if (limiteNumero > maximo) {
    limiteNumero = maximo;
  }

  return limiteNumero;
};

/**
 * VALIDAR DATOS DE NOTIFICACIÓN
 * @param {Object} params - Parámetros de la notificación
 * @param {number} params.usuarioId - ID del usuario
 * @param {string} params.tipo - Tipo de notificación
 * @param {string} params.titulo - Título
 * @param {string} params.mensaje - Mensaje
 * @throws {Error} Si faltan campos requeridos o son inválidos
 *
 * Frontend: Enviar datos para crear notificación
 * Backend relacionado: crearNotificacion
 */
export const validarDatosNotificacion = ({
  usuarioId,
  tipo,
  titulo,
  mensaje,
}) => {
  if (!usuarioId || isNaN(usuarioId)) {
    throw new Error(
      "El ID de usuario es requerido y debe ser un número válido",
    );
  }
  if (!tipo) {
    throw new Error("El tipo de notificación es requerido");
  }
  if (!TIPOS_NOTIFICACION.includes(tipo)) {
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
