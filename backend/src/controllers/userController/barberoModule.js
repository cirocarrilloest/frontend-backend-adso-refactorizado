// backend/src/controllers/userController/barberoModule.js
import { userRepository } from "../../repositories/userRepository.js";
import { ok } from "../../utils/responseUtils.js";
import { NotFoundError } from "../../utils/errors.js";

export const getBarberos = async (req, res, next) => {
  try {
    const barberos = await userRepository.getBarberos();
    return ok(res, { barberos });
  } catch (error) {
    next(error);
  }
};

export const getBarberoPerfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const barbero = await userRepository.findById(id);

    if (!barbero) {
      throw new NotFoundError("Barbero no encontrado");
    }

    if (barbero.rol !== "barbero") {
      return res.status(400).json({
        success: false,
        mensaje: "El usuario no es un barbero",
      });
    }

    const horarios = await userRepository.getHorarioBarbero(id);

    return ok(res, {
      barbero: {
        id: barbero.id,
        nombre: barbero.nombre,
        email: barbero.email,
        telefono: barbero.telefono,
        rol: barbero.rol,
      },
      horarios,
    });
  } catch (error) {
    next(error);
  }
};

export const getHorarioBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const horarios = await userRepository.getHorarioBarbero(id);
    return ok(res, { horarios });
  } catch (error) {
    next(error);
  }
};

export const setHorarioBarbero = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dia_semana, hora_inicio, hora_fin } = req.body;

    const horario = await userRepository.setHorarioBarbero(id, {
      dia_semana,
      hora_inicio,
      hora_fin,
    });

    return ok(res, { message: "Horario configurado exitosamente", horario });
  } catch (error) {
    next(error);
  }
};

export const deleteHorarioBarbero = async (req, res, next) => {
  try {
    const { id, dia } = req.params;
    await userRepository.deleteHorarioBarbero(id, dia);
    return ok(res, { message: "Horario eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};
