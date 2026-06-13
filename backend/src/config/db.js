// src/config/db.js
import mysql from "mysql2/promise";
import chalk from "chalk";

let pool = null;
let connectingPromise = null;

// Crear conexión a la base de datos
export const connectDB = async () => {
  if (pool) return pool;

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    try {
      const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName],
      );

      if (missingVars.length > 0) {
        throw new Error(
          `Variables de entorno faltantes: ${missingVars.join(", ")}`,
        );
      }

      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      const connection = await pool.getConnection();
      console.log(chalk.green("✓ MySQL conectado correctamente"));
      console.log(
        chalk.gray(
          `  Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`,
        ),
      );
      console.log(chalk.gray(`  Base de datos: ${process.env.DB_NAME}`));
      connection.release();

      pool.on("error", (err) => {
        console.error(chalk.red("Error en el pool de conexiones:"), err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          console.log(chalk.yellow("Reconectando..."));
          pool = null;
        }
      });

      return pool;
    } catch (error) {
      console.error(chalk.red("✗ Error conectando a MySQL:"), error.message);
      pool = null;
      throw error;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

// VERSIÓN ESPECIAL: Funciona CON o SIN await
export const getPool = () => {
  // Si ya hay pool, devolverlo directamente
  if (pool) {
    return pool;
  }

  // Si no hay pool pero hay una conexión en progreso, devolver la promesa
  if (connectingPromise) {
    return connectingPromise;
  }

  // Si no hay nada, iniciar conexión y devolver la promesa
  const connectionPromise = connectDB();
  // Guardar referencia para futuras llamadas
  if (!connectingPromise) {
    Object.defineProperty(connectionPromise, "execute", {
      get() {
        throw new Error(
          "ERROR: Estás usando getPool() sin await. Cambia a: const pool = await getPool()",
        );
      },
    });
  }
  return connectionPromise;
};

// Para código que necesita el pool de forma síncrona (después de conectar)
export const getPoolSync = () => {
  if (!pool) {
    throw new Error(
      "Base de datos no conectada. Asegúrate de llamar a connectDB() primero.",
    );
  }
  return pool;
};

// Helper para queries
export const query = async (sql, params = []) => {
  const currentPool = await getPool();
  const [rows] = await currentPool.execute(sql, params);
  return rows;
};

export const getConnection = async () => {
  const currentPool = await getPool();
  return await currentPool.getConnection();
};

export const closeDB = async () => {
  if (pool) {
    await pool.end();
    console.log(chalk.yellow("Conexiones MySQL cerradas"));
    pool = null;
  }
};

export const checkHealth = async () => {
  if (!pool) {
    return { healthy: false, error: "Pool no inicializado" };
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT 1 as connected");
    connection.release();
    return {
      healthy: true,
      timestamp: new Date().toISOString(),
      connected: rows[0]?.connected === 1,
    };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};
