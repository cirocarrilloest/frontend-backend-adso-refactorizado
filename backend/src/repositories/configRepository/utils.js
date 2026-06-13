// backend/src/repositories/configRepository/utils.js

/**
 * TIPOS DE CONFIGURACIÓN VÁLIDOS
 * @constant {Array<string>}
 *
 * Frontend: Selector de tipo al crear/editar configuración
 * Backend relacionado: Validación de tipos
 */
export const TIPOS_CONFIG = ["texto", "numero", "booleano", "json"];

/**
 * PARSEA EL VALOR DE CONFIGURACIÓN SEGÚN SU TIPO
 * @param {string} valor - Valor almacenado en BD
 * @param {string} tipo - Tipo de configuración (texto, numero, booleano, json)
 * @returns {any} Valor parseado
 *
 * Frontend: Mostrar configuración con tipo correcto
 * Backend relacionado: Al leer configuración de BD
 *
 * Ejemplos:
 * - tipo "numero": "123" → 123
 * - tipo "booleano": "true" → true
 * - tipo "json": '{"key":"value"}' → { key: "value" }
 * - tipo "texto": "hola" → "hola"
 */
export const parsearValor = (valor, tipo) => {
  if (valor === null || valor === undefined) return null;

  switch (tipo) {
    case "numero":
      return Number(valor);
    case "booleano":
      return valor === "true" || valor === "1" || valor === true;
    case "json":
      try {
        return JSON.parse(valor);
      } catch {
        console.warn(`[configRepository] No se pudo parsear JSON:`, valor);
        return valor;
      }
    case "texto":
    default:
      return valor;
  }
};

/**
 * SERIALIZA UN VALOR PARA ALMACENARLO EN BD
 * @param {any} valor - Valor a serializar
 * @returns {string|null} Valor serializado
 *
 * Frontend: Enviar configuración al backend
 * Backend relacionado: Al guardar configuración en BD
 *
 * Ejemplos:
 * - Objeto → '{"key":"value"}'
 * - Número → "123"
 * - Booleano → "true"
 * - Texto → "texto"
 */
export const serializarValor = (valor) => {
  if (valor === null || valor === undefined) return null;
  return typeof valor === "object" ? JSON.stringify(valor) : String(valor);
};

/**
 * VALIDAR TIPO DE CONFIGURACIÓN
 * @param {string} tipo - Tipo a validar
 * @returns {boolean} True si es válido
 * @throws {Error} Si el tipo no es válido
 *
 * Frontend: Validación al crear configuración
 * Backend relacionado: Antes de insertar nueva configuración
 */
export const validarTipoConfig = (tipo) => {
  if (!TIPOS_CONFIG.includes(tipo)) {
    throw new Error(
      `Tipo de configuración inválido: ${tipo}. Tipos válidos: ${TIPOS_CONFIG.join(", ")}`,
    );
  }
  return true;
};
