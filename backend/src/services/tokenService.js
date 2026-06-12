// backend/src/services/tokenService.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Genera un token JWT firmado
 */
export const generarToken = (id, email, rol) => {
  return jwt.sign({ id, email, rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

/**
 * Verifica un token JWT
 */
export const verifyToken = (token) => {
  try {
    if (tokenEstaInvalidado(token)) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Blacklist de tokens
const tokenBlacklist = new Map();

// Limpiar tokens expirados cada 10 minutos
setInterval(
  () => {
    const ahora = Date.now();
    for (const [token, exp] of tokenBlacklist.entries()) {
      if (exp < ahora) tokenBlacklist.delete(token);
    }
  },
  10 * 60 * 1000,
);

export const invalidarToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    const exp = decoded?.exp ? decoded.exp * 1000 : Date.now() + 60 * 60 * 1000;
    tokenBlacklist.set(token, exp);
  } catch {
    tokenBlacklist.set(token, Date.now() + 60 * 60 * 1000);
  }
};

export const tokenEstaInvalidado = (token) => {
  return tokenBlacklist.has(token);
};

export default {
  generarToken,
  verifyToken,
  invalidarToken,
  tokenEstaInvalidado,
};
