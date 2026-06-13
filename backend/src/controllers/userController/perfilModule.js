// backend/src/controllers/userController/perfilModule.js
import { userRepository } from "../../repositories/userRepository.js";
import { getPool } from "../../config/db.js";
import { ok } from "../../utils/responseUtils.js";
import { ValidationError } from "../../utils/errors.js";

export const updateMiPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, email, telefono, pass } = req.body;

    const updates = {};
    if (nombre) updates.nombre = nombre;
    if (email) updates.email = email;
    if (telefono !== undefined) updates.telefono = telefono;
    if (pass) updates.pass = pass;

    const usuarioActualizado = await userRepository.update(usuarioId, updates);

    return ok(res, {
      message: "Perfil actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMiCuenta = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    const pool = getPool();
    const [citas] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE cliente_id = ? AND estado IN ('pendiente', 'confirmada')`,
      [usuarioId],
    );

    if (citas[0].total > 0) {
      throw new ValidationError(
        `No puedes eliminar tu cuenta porque tienes ${citas[0].total} cita(s) pendiente(s)`,
      );
    }

    await userRepository.delete(usuarioId);
    return ok(res, { message: "Cuenta eliminada exitosamente" });
  } catch (error) {
    next(error);
  }
};
