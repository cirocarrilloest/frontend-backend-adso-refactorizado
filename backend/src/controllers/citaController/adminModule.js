// src/controllers/citaController/adminModule.js
import adminCitaService from "../../services/adminCitaService.js";
import { badRequest, created, ok } from "../../utils/responseUtils.js";

export const crearCitaAdmin = async (req, res, next) => {
  try {
    const { cliente_id, barbero_id, servicio_id, fecha, hora, notas } =
      req.body;

    if (!cliente_id || !barbero_id || !servicio_id || !fecha || !hora) {
      return badRequest(res, "Todos los campos son requeridos");
    }

    const cita = await adminCitaService.crearCitaAdmin({
      clienteId: parseInt(cliente_id),
      barberoId: parseInt(barbero_id),
      servicioId: parseInt(servicio_id),
      fecha,
      hora,
      notas,
    });

    return created(res, {
      message: "Cita creada exitosamente por el administrador",
      cita,
    });
  } catch (error) {
    next(error);
  }
};

export const editarCitaAdmin = async (req, res, next) => {
  try {
    const cita = await adminCitaService.editarCitaAdmin(
      req.params.id,
      req.body,
    );
    return ok(res, { message: "Cita actualizada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const getAllCitas = async (req, res, next) => {
  try {
    const {
      estado,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 15,
    } = req.query;

    const citas = await adminCitaService.getAllCitas(
      { estado, fecha_desde, fecha_hasta },
      { page: parseInt(page), limit: parseInt(limit) },
    );

    return ok(res, { citas });
  } catch (error) {
    next(error);
  }
};
