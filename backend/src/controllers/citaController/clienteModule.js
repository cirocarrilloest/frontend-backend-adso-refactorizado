// src/controllers/citaController/clienteModule.js
import clienteCitaService from "../../services/clienteCitaService.js";
import {
  badRequest,
  created,
  ok,
  forbidden,
} from "../../utils/responseUtils.js";

export const agendarCita = async (req, res, next) => {
  try {
    if (req.usuario.rol !== "cliente" && req.usuario.rol !== "admin") {
      return forbidden(res, "Solo los clientes pueden agendar citas");
    }

    const { barbero_id, servicio_id, fecha, hora, notas } = req.body;
    if (!barbero_id || !servicio_id || !fecha || !hora) {
      return badRequest(
        res,
        "Faltan campos requeridos: barbero_id, servicio_id, fecha, hora",
      );
    }

    const cita = await clienteCitaService.agendar({
      clienteId: req.usuario.id,
      barberoId: barbero_id,
      servicioId: servicio_id,
      fecha,
      hora,
      notas,
      clienteNombre: req.usuario.nombre,
    });

    return created(res, { message: "Cita agendada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const getMisCitas = async (req, res, next) => {
  try {
    const citas = await clienteCitaService.getMisCitas(req.usuario.id);
    return ok(res, { citas });
  } catch (error) {
    next(error);
  }
};

export const getProximasCitas = async (req, res, next) => {
  try {
    const citas = await clienteCitaService.getProximasCitas(req.usuario.id);
    return ok(res, { citas, total: citas.length });
  } catch (error) {
    next(error);
  }
};

export const getHistorialCitas = async (req, res, next) => {
  try {
    let limite = parseInt(req.query.limite) || 10;
    limite = Math.min(Math.max(limite, 1), 100);
    const citas = await clienteCitaService.getHistorialCitas(
      req.usuario.id,
      limite,
    );
    return ok(res, { citas, total: citas.length, limite });
  } catch (error) {
    next(error);
  }
};

export const cancelarCita = async (req, res, next) => {
  try {
    const cita = await clienteCitaService.cancelar({
      citaId: req.params.id,
      usuarioId: req.usuario.id,
      usuarioNombre: req.usuario.nombre,
    });
    return ok(res, { message: "Cita cancelada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};

export const reagendarCita = async (req, res, next) => {
  try {
    const { fecha, hora } = req.body;
    if (!fecha || !hora) {
      return badRequest(res, "Se requiere fecha y hora");
    }

    const cita = await clienteCitaService.reagendar({
      citaId: req.params.id,
      nuevaFecha: fecha,
      nuevaHora: hora,
      usuarioId: req.usuario.id,
    });

    return ok(res, { message: "Cita reagendada exitosamente", cita });
  } catch (error) {
    next(error);
  }
};
