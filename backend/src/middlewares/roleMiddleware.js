// backend/src/middlewares/roleMiddleware.js
import { ForbiddenError } from "../utils/errors.js";

/**
 * Middleware para verificar roles
 */
export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      throw new ForbiddenError("No autenticado");
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new ForbiddenError(
        `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(" o ")}`,
      );
    }

    next();
  };
};

export const esAdmin = verificarRol(["admin"]);
export const esBarberoOAdmin = verificarRol(["barbero", "admin"]);
export const esClienteOAdmin = verificarRol(["cliente", "admin"]);

export default { verificarRol, esAdmin, esBarberoOAdmin, esClienteOAdmin };
