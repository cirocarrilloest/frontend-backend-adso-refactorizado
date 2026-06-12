// backend/src/repositories/configRepository.js
import { getPool } from "../config/db.js";

/**
 * Parsea el valor de configuración según su tipo
 */
const parsearValor = (valor, tipo) => {
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
 * Serializa un valor para almacenarlo en BD
 */
const serializarValor = (valor) => {
  if (valor === null || valor === undefined) return null;
  return typeof valor === "object" ? JSON.stringify(valor) : String(valor);
};

export const configRepository = {
  /**
   * Retorna toda la configuración
   */
  async getAll() {
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
  },

  /**
   * Retorna la configuración de una clave específica
   */
  async getByKey(clave) {
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
  },

  /**
   * Actualiza el valor de una clave
   */
  async set(clave, valor) {
    const pool = getPool();

    const [existe] = await pool.execute(
      "SELECT tipo FROM configuracion WHERE clave = ?",
      [clave],
    );
    if (!existe[0]) return null;

    await pool.execute("UPDATE configuracion SET valor = ? WHERE clave = ?", [
      serializarValor(valor),
      clave,
    ]);

    return this.getByKey(clave);
  },

  /**
   * Actualiza múltiples claves en paralelo
   */
  async setMany(pares) {
    const pool = getPool();

    await Promise.all(
      Object.entries(pares).map(([clave, valor]) =>
        pool.execute("UPDATE configuracion SET valor = ? WHERE clave = ?", [
          serializarValor(valor),
          clave,
        ]),
      ),
    );

    return this.getAll();
  },
};

export default configRepository;
