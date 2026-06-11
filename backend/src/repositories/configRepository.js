// src/repositories/configRepository.js
import { getPool } from "../config/db.js";

/**
 * Repositorio de configuración.
 * Todas las consultas SQL relacionadas con configuración están aquí.
 */

const parsearValor = (valor, tipo) => {
  if (valor === null || valor === undefined) return null;
  switch (tipo) {
    case "numero":
      return Number(valor);
    case "booleano":
      return valor === "true" || valor === "1";
    case "json":
      try {
        return JSON.parse(valor);
      } catch {
        return valor;
      }
    default:
      return valor;
  }
};

export const configRepository = {
  /**
   * Obtiene toda la configuración como objeto
   */
  async getAll() {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT clave, valor, descripcion, tipo FROM configuracion ORDER BY clave",
    );

    const config = {};
    rows.forEach((r) => {
      config[r.clave] = {
        valor: parsearValor(r.valor, r.tipo),
        descripcion: r.descripcion,
        tipo: r.tipo,
      };
    });
    return config;
  },

  /**
   * Obtiene una configuración por clave
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
   * Actualiza una configuración
   */
  async set(clave, valor) {
    const pool = getPool();

    const [existe] = await pool.execute(
      "SELECT tipo FROM configuracion WHERE clave = ?",
      [clave],
    );
    if (!existe[0]) return null;

    const valorStr =
      typeof valor === "object" ? JSON.stringify(valor) : String(valor);

    await pool.execute("UPDATE configuracion SET valor = ? WHERE clave = ?", [
      valorStr,
      clave,
    ]);

    return this.getByKey(clave);
  },

  /**
   * Actualiza múltiples configuraciones
   */
  async setMany(pares) {
    const pool = getPool();
    const entries = Object.entries(pares);

    await Promise.all(
      entries.map(([clave, valor]) => {
        const valorStr =
          typeof valor === "object" ? JSON.stringify(valor) : String(valor);
        return pool.execute(
          "UPDATE configuracion SET valor = ? WHERE clave = ?",
          [valorStr, clave],
        );
      }),
    );

    return this.getAll();
  },
};

export default configRepository;
