// src/controllers/citaController/disponibilidadModule.js
import barberoCitaService from "../../services/barberoCitaService.js";
import citaRepository from "../../repositories/citaRepository.js";
import { badRequest, ok } from "../../utils/responseUtils.js";

export const getHorariosDisponibles = async (req, res, next) => {
  try {
    const { id: barberoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return badRequest(res, "Se requiere fecha");
    }

    const resultado = await barberoCitaService.getHorariosDisponibles(
      barberoId,
      fecha,
    );

    return ok(res, {
      horarios_disponibles: resultado.horarios,
      mensaje:
        resultado.mensaje ||
        `${resultado.horarios.length} horarios disponibles`,
    });
  } catch (error) {
    next(error);
  }
};

export const verificarDisponibilidad = async (req, res, next) => {
  try {
    const { barbero_id, fecha, hora } = req.query;

    if (!barbero_id || !fecha || !hora) {
      return badRequest(res, "Se requiere barbero_id, fecha y hora");
    }

    const disponible = await citaRepository.existsDuplicate(
      barbero_id,
      fecha,
      hora,
    );

    return ok(res, {
      disponible: !disponible,
      mensaje: disponible ? "Horario no disponible" : "Horario disponible",
    });
  } catch (error) {
    next(error);
  }
};
