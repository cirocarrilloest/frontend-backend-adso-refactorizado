// src/controllers/citaController/comunesModule.js
import citaRepository from "../../repositories/citaRepository.js";
import { ok, notFound, forbidden } from "../../utils/responseUtils.js";

export const getCitaById = async (req, res, next) => {
  try {
    const cita = await citaRepository.findById(req.params.id);
    if (!cita) {
      return notFound(res, "Cita no encontrada");
    }
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return forbidden(res, "No tienes permiso para ver esta cita");
    }
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return forbidden(res, "No tienes permiso para ver esta cita");
    }
    return ok(res, { cita });
  } catch (error) {
    next(error);
  }
};
