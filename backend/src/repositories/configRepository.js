// src/repositories/configRepository.js
/**
 * configRepository.js
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: parsearValor duplicada en configModel.js y configRepository.js
 * - Problema anterior: configModel.js era un wrapper innecesario sobre este repositorio
 * - Solución: este archivo es la única fuente de verdad para acceso a configuración
 * - configModel.js queda como re-export de compatibilidad (ver archivo separado)
 *
 * Principio aplicado: DRY + SRP (Single Responsibility Principle)
 */

import { getPool } from "../config/db.js";

// ─── Utilidad privada ────────────────────────────────────────────────────────

/**
 * Parsea el valor de configuración según su tipo declarado en BD.
 * Función privada — no exportar para evitar dependencias externas sobre
 * la representación interna de los datos.
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
        console.warn(
          `[configRepository] No se pudo parsear JSON para tipo "${tipo}":`,
          valor,
        );
        return valor;
      }

    case "texto":
    default:
      return valor;
  }
};

/**
 * Serializa un valor para almacenarlo en BD.
 * Los objetos y arrays se convierten a JSON string.
 */
const serializarValor = (valor) => {
  if (valor === null || valor === undefined) return null;
  return typeof valor === "object" ? JSON.stringify(valor) : String(valor);
};

// ─── Repositorio ─────────────────────────────────────────────────────────────

export const configRepository = {
  /**
   * Retorna toda la configuración como mapa { clave: { valor, tipo, descripcion } }.
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
   * Retorna la configuración de una clave específica, con valor ya parseado.
   * Retorna null si la clave no existe.
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
   * Actualiza el valor de una clave.
   * Retorna null si la clave no existe en BD.
   */
  async set(clave, valor) {
    const pool = getPool();

    // Verificar que la clave existe antes de actualizar
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
   * Actualiza múltiples claves en paralelo.
   * Retorna la configuración completa actualizada.
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
