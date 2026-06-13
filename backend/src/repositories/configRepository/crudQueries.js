// backend/src/repositories/configRepository/crudQueries.js
import { getPool } from "../../config/db.js";
import { parsearValor, serializarValor, validarTipoConfig } from "./utils.js";

/**
 * OBTENER TODA LA CONFIGURACIÓN
 * @returns {Promise<Object>} Objeto con todas las configuraciones
 *
 * Frontend: Panel de configuración (Admin)
 * - Componente: ConfiguracionPanel
 * - Endpoint: GET /api/configuracion
 *
 * Backend relacionado: configController.getConfiguracion
 *
 * Formato de respuesta:
 * {
 *   "horario_apertura": { valor: "09:00", descripcion: "...", tipo: "texto" },
 *   "dias_laborales": { valor: ["lunes", "martes"], descripcion: "...", tipo: "json" }
 * }
 */
export const getAll = async () => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT clave, valor, descripcion, tipo FROM configuracion ORDER BY clave",
  );

  return rows.reduce((acc, row) => {
    acc[row.clave] = {
      valor: parsearValor(row.valor, row.tipo),
      descripcion: row.descripcion,
      tipo: row.tipo,
    };
    return acc;
  }, {});
};

/**
 * OBTENER CONFIGURACIÓN POR CLAVE
 * @param {string} clave - Clave de configuración
 * @returns {Promise<Object|null>} Configuración encontrada o null
 *
 * Frontend: Obtener valor de configuración específica
 * - Componente: ConfiguracionItem
 * - Endpoint: GET /api/configuracion/:key
 *
 * Backend relacionado: configController.getConfigByKeyController
 *
 * Formato de respuesta:
 * {
 *   clave: "horario_apertura",
 *   valor: "09:00",
 *   descripcion: "Hora de apertura del negocio",
 *   tipo: "texto"
 * }
 */
export const getByKey = async (clave) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT clave, valor, descripcion, tipo FROM configuracion WHERE clave = ?",
    [clave],
  );

  if (!rows[0]) return null;

  return {
    ...rows[0],
    valor: parsearValor(rows[0].valor, rows[0].tipo),
  };
};

/**
 * ACTUALIZAR UNA CONFIGURACIÓN POR CLAVE
 * @param {string} clave - Clave de configuración
 * @param {any} valor - Nuevo valor
 * @returns {Promise<Object|null>} Configuración actualizada o null si no existe
 *
 * Frontend: Editar configuración individual
 * - Componente: ConfiguracionEditForm
 * - Endpoint: PUT /api/configuracion/:key
 * - Body: { valor }
 *
 * Backend relacionado: configController.updateConfig
 */
export const set = async (clave, valor) => {
  const pool = getPool();

  // Verificar que la clave existe y obtener su tipo
  const [existe] = await pool.execute(
    "SELECT tipo FROM configuracion WHERE clave = ?",
    [clave],
  );
  if (!existe[0]) return null;

  // Serializar valor según el tipo
  await pool.execute("UPDATE configuracion SET valor = ? WHERE clave = ?", [
    serializarValor(valor),
    clave,
  ]);

  return getByKey(clave);
};

/**
 * ACTUALIZAR MÚLTIPLES CONFIGURACIONES
 * @param {Object} pares - Objeto con pares clave-valor
 * @returns {Promise<Object>} Todas las configuraciones actualizadas
 *
 * Frontend: Guardar múltiples cambios de configuración
 * - Componente: ConfiguracionMultiEditForm
 * - Endpoint: PUT /api/configuracion/multiple
 * - Body: { configuraciones: { clave1: valor1, clave2: valor2 } }
 *
 * Backend relacionado: configController.updateMultipleConfig
 *
 * Ejemplo de entrada:
 * {
 *   "horario_apertura": "10:00",
 *   "horario_cierre": "19:00",
 *   "dias_laborales": ["lunes", "martes", "miercoles"]
 * }
 */
export const setMany = async (pares) => {
  const pool = getPool();

  // Actualizar todas las configuraciones en paralelo
  await Promise.all(
    Object.entries(pares).map(([clave, valor]) =>
      pool.execute("UPDATE configuracion SET valor = ? WHERE clave = ?", [
        serializarValor(valor),
        clave,
      ]),
    ),
  );

  // Retornar todas las configuraciones actualizadas
  return getAll();
};
