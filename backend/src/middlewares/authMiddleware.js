// backend/src/middlewares/authMiddleware.js
import { verifyToken } from "../services/tokenService.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Middleware de autenticación
 * Verifica que el token sea válido y añade el usuario a req
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new UnauthorizedError("No se proporcionó token de autenticación");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        'Formato de token no válido. Se espera "Bearer <token>"',
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError("Token inválido o expirado");
    }

    req.usuario = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
