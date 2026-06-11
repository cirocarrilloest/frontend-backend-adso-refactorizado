// src/models/configModel.js
import { getPool } from "../config/db.js";

/** Devuelve todas las configuraciones como objeto { clave: valorParseado } */
export const getAllConfig = async () => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT clave, valor, descripcion, tipo FROM configuracion ORDER BY clave",
  );

  // Construir objeto plano con valores ya parseados según tipo
  const config = {};
  rows.forEach((r) => {
    config[r.clave] = {
      valor: parsearValor(r.valor, r.tipo),
      descripcion: r.descripcion,
      tipo: r.tipo,
    };
  });
  return config;
};

/** Devuelve el valor parseado de una clave específica */
export const getConfigByKey = async (clave) => {
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

/** Actualiza el valor de una clave */
export const setConfig = async (clave, valor) => {
  const pool = getPool();

  // Verificar que la clave existe
  const [existe] = await pool.execute(
    "SELECT tipo FROM configuracion WHERE clave = ?",
    [clave],
  );
  if (!existe[0]) return null;

  // Serializar si es json/booleano
  const valorStr =
    typeof valor === "object" ? JSON.stringify(valor) : String(valor);

  await pool.execute("UPDATE configuracion SET valor = ? WHERE clave = ?", [
    valorStr,
    clave,
  ]);

  return getConfigByKey(clave);
};

/** Actualiza múltiples claves en una sola llamada */
export const setManyConfig = async (pares) => {
  // pares: { clave: valor, ... }
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

  return getAllConfig();
};

// Utilidad de parseo
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
