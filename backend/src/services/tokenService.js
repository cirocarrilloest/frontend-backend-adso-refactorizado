import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Validación de seguridad para la variable de entorno
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET no está definido en .env");
}

/**
 * Genera un token JWT firmado
 */
export const generarToken = (id, email, rol) => {
  // Nota: Evita enviar información sensible en el payload si no es necesaria
  return jwt.sign({ id, email, rol }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifica un token JWT
 */
export const verifyToken = (token) => {
  try {
    if (!token || tokenEstaInvalidado(token)) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Es útil loguear el error internamente (opcional)
    return null;
  }
};

// Blacklist de tokens usando un Set en lugar de un Map para optimizar memoria
// Guardamos solo el token como clave
const tokenBlacklist = new Set();

/**
 * Invalida un token agregándolo a la blacklist
 */
export const invalidarToken = (token) => {
  if (!token) return;
  tokenBlacklist.add(token);
};

export const tokenEstaInvalidado = (token) => {
  return tokenBlacklist.has(token);
};

// Limpieza eficiente de la blacklist
setInterval(
  () => {
    for (const token of tokenBlacklist) {
      try {
        // Verificamos si el token ha expirado realmente según JWT
        jwt.verify(token, JWT_SECRET);
      } catch (err) {
        // Si verify falla, es porque expiró o es inválido, así que lo removemos
        tokenBlacklist.delete(token);
      }
    }
  },
  60 * 60 * 1000,
); // Limpieza cada 1 hora es suficiente y consume menos CPU

export default {
  generarToken,
  verifyToken,
  invalidarToken,
  tokenEstaInvalidado,
};
