// backend/src/controllers/userController/comunesModule.js
import { userRepository } from "../../repositories/userRepository.js";
import { ok } from "../../utils/responseUtils.js";
import { NotFoundError } from "../../utils/errors.js";

export const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await userRepository.findById(id);
    if (!usuario) {
      throw new NotFoundError("Usuario");
    }
    return ok(res, { usuario });
  } catch (error) {
    next(error);
  }
};
