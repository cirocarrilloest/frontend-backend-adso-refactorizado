// src/controllers/citaController.js
// VERSIÓN COMPLETA - SOLO ORQUESTACIÓN HTTP

import * as citaService from "../services/citaService.js";
import citaModel from "../models/citaModel.js";
import {
  ok,
  created,
  badRequest,
  forbidden,
  notFound,
  conflict,
  serverError,
} from "../utils/responseUtils.js";

const manejarResultado = (res, resultado, successHandler) => {
  if (resultado?.notFound) return notFound(res, resultado.notFound);
  if (resultado?.forbidden) return forbidden(res, resultado.forbidden);
  if (resultado?.conflict) return conflict(res, resultado.conflict);
  if (resultado?.error) return badRequest(res, resultado.error);
  return successHandler(resultado);
};

// ─── CLIENTE ────────────────────────────────────────────────────────────────

export const agendarCita = async (req, res) => {
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

    const resultado = await citaService.agendarCita({
      clienteId: req.usuario.id,
      barberoId: barbero_id,
      servicioId: servicio_id,
      fecha,
      hora,
      notas,
      clienteNombre: req.usuario.nombre,
    });

    return manejarResultado(res, resultado, ({ cita }) =>
      created(res, { message: "Cita agendada exitosamente", cita }),
    );
  } catch (error) {
    return serverError(res, "agendarCita", error);
  }
};

export const getMisCitas = async (req, res) => {
  try {
    const citas = await citaModel.getCitasByCliente(req.usuario.id);
    return ok(res, { citas });
  } catch (error) {
    return serverError(res, "getMisCitas", error);
  }
};

export const getProximasCitas = async (req, res) => {
  try {
    const citas = await citaModel.getProximasCitasByCliente(req.usuario.id);
    return ok(res, { citas, total: citas.length });
  } catch (error) {
    return serverError(res, "getProximasCitas", error);
  }
};

export const getHistorialCitas = async (req, res) => {
  try {
    let limite = parseInt(req.query.limite) || 10;
    if (limite <= 0) limite = 10;
    if (limite > 100) limite = 100;
    const citas = await citaModel.getHistorialCitasByCliente(
      req.usuario.id,
      limite,
    );
    return ok(res, { citas, total: citas.length, limite });
  } catch (error) {
    return serverError(res, "getHistorialCitas", error);
  }
};

export const getCitaById = async (req, res) => {
  try {
    const cita = await citaModel.getCitaById(req.params.id);
    if (!cita) return notFound(res, "Cita no encontrada");
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return forbidden(res, "No tienes permiso para ver esta cita");
    }
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return forbidden(res, "No tienes permiso para ver esta cita");
    }
    return ok(res, { cita });
  } catch (error) {
    return serverError(res, "getCitaById", error);
  }
};

export const reagendarCita = async (req, res) => {
  try {
    const { fecha, hora } = req.body;
    if (!fecha || !hora) return badRequest(res, "Se requiere fecha y hora");

    const resultado = await citaService.reagendarCita({
      citaId: req.params.id,
      fecha,
      hora,
      usuarioId: req.usuario.id,
      usuarioRol: req.usuario.rol,
    });

    return manejarResultado(res, resultado, ({ cita }) =>
      ok(res, { message: "Cita reagendada exitosamente", cita }),
    );
  } catch (error) {
    return serverError(res, "reagendarCita", error);
  }
};

export const cancelarCita = async (req, res) => {
  try {
    const resultado = await citaService.cancelarCita({
      citaId: req.params.id,
      usuarioId: req.usuario.id,
      usuarioRol: req.usuario.rol,
      usuarioNombre: req.usuario.nombre,
    });

    return manejarResultado(res, resultado, ({ cita }) =>
      ok(res, { message: "Cita cancelada exitosamente", cita }),
    );
  } catch (error) {
    return serverError(res, "cancelarCita", error);
  }
};

// ─── BARBERO / ADMIN ────────────────────────────────────────────────────────

export const getAgendaDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    const barberoId =
      req.usuario.rol === "admin" && req.query.barbero_id
        ? req.query.barbero_id
        : req.usuario.id;
    const citas = await citaModel.getAgendaDiaByBarbero(barberoId, fecha);
    return ok(res, {
      fecha: fecha || new Date().toISOString().split("T")[0],
      citas,
      total_citas: citas.length,
    });
  } catch (error) {
    return serverError(res, "getAgendaDia", error);
  }
};

export const getResumenCitas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const resumen = await citaModel.getResumenCitasByBarbero(
      req.usuario.id,
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { resumen });
  } catch (error) {
    return serverError(res, "getResumenCitas", error);
  }
};

export const getAgendaSemana = async (req, res) => {
  try {
    const { id: barberoId } = req.params;
    const fecha =
      req.query.fecha_inicio || new Date().toISOString().split("T")[0];
    if (
      req.usuario.rol === "barbero" &&
      parseInt(barberoId) !== req.usuario.id
    ) {
      return forbidden(
        res,
        "No tienes permiso para ver la agenda de otro barbero",
      );
    }
    const resultado = await citaModel.getCitasSemanaByBarbero(barberoId, fecha);
    return ok(res, {
      ...resultado,
      total_citas: Object.values(resultado.agenda).flat().length,
    });
  } catch (error) {
    return serverError(res, "getAgendaSemana", error);
  }
};

export const getCitasBarbero = async (req, res) => {
  try {
    const { barbero_id } = req.params;
    const { fecha } = req.query;
    const id = req.usuario.rol === "barbero" ? req.usuario.id : barbero_id;
    const citas = await citaModel.getCitasByBarbero(id, fecha);
    return ok(res, { citas });
  } catch (error) {
    return serverError(res, "getCitasBarbero", error);
  }
};

export const getHorariosDisponibles = async (req, res) => {
  try {
    const { id: barberoId } = req.params;
    const { fecha } = req.query;
    if (!fecha)
      return badRequest(res, "Se requiere el parámetro fecha (YYYY-MM-DD)");

    const duracionSlot = parseInt(req.config?.duracion_slot?.valor || 30);
    const resultado = await citaService.getHorariosDisponibles({
      barberoId,
      fecha,
      duracionSlot,
    });

    return manejarResultado(res, resultado, ({ horarios, barbero }) =>
      ok(res, {
        barbero_id: barberoId,
        fecha,
        duracion_slot: duracionSlot,
        horarios_disponibles: horarios,
        total_disponibles: horarios.length,
      }),
    );
  } catch (error) {
    return serverError(res, "getHorariosDisponibles", error);
  }
};

export const actualizarEstadoCita = async (req, res) => {
  try {
    const resultado = await citaService.actualizarEstadoCita({
      citaId: req.params.id,
      estado: req.body.estado,
      usuarioId: req.usuario.id,
      usuarioRol: req.usuario.rol,
    });
    return manejarResultado(res, resultado, ({ cita }) =>
      ok(res, { message: "Estado de la cita actualizado", cita }),
    );
  } catch (error) {
    return serverError(res, "actualizarEstadoCita", error);
  }
};

export const confirmarCita = async (req, res) => {
  try {
    const resultado = await citaService.confirmarCita({
      citaId: req.params.id,
      usuarioId: req.usuario.id,
      usuarioRol: req.usuario.rol,
    });
    return manejarResultado(res, resultado, ({ cita }) =>
      ok(res, { message: "Cita confirmada exitosamente", cita }),
    );
  } catch (error) {
    return serverError(res, "confirmarCita", error);
  }
};

export const finalizarCita = async (req, res) => {
  try {
    const resultado = await citaService.finalizarCita({
      citaId: req.params.id,
      usuarioId: req.usuario.id,
      usuarioRol: req.usuario.rol,
    });
    return manejarResultado(res, resultado, ({ cita }) =>
      ok(res, { message: "Cita finalizada exitosamente", cita }),
    );
  } catch (error) {
    return serverError(res, "finalizarCita", error);
  }
};

export const verificarDisponibilidad = async (req, res) => {
  try {
    const { barbero_id, fecha, hora } = req.query;
    if (!barbero_id || !fecha || !hora) {
      return badRequest(res, "Se requiere barbero_id, fecha y hora");
    }
    const disponible = await citaModel.verificarDisponibilidad(
      barbero_id,
      fecha,
      hora,
    );
    const horariosOcupados = await citaModel.getHorariosOcupados(
      barbero_id,
      fecha,
    );
    return ok(res, { disponible, horarios_ocupados: horariosOcupados });
  } catch (error) {
    return serverError(res, "verificarDisponibilidad", error);
  }
};

// ─── ADMIN ──────────────────────────────────────────────────────────────────

export const crearCitaAdmin = async (req, res) => {
  try {
    const { cliente_id, barbero_id, servicio_id, fecha, hora, notas } =
      req.body;
    if (!cliente_id || !barbero_id || !servicio_id || !fecha || !hora) {
      return badRequest(res, "Todos los campos son requeridos");
    }

    const resultado = await citaService.crearCitaAdmin({
      clienteId: parseInt(cliente_id),
      barberoId: parseInt(barbero_id),
      servicioId: parseInt(servicio_id),
      fecha,
      hora,
      notas,
    });

    return manejarResultado(res, resultado, ({ cita }) =>
      created(res, {
        message: "Cita creada exitosamente por el administrador",
        cita,
      }),
    );
  } catch (error) {
    return serverError(res, "crearCitaAdmin", error);
  }
};

export const getAllCitas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 15;
    if (page <= 0) page = 1;
    if (limit <= 0 || limit > 100) limit = 15;

    const citas = await citaModel.getAllCitas({
      estado,
      fecha_desde,
      fecha_hasta,
    });
    const total = citas.length;
    const paginated = citas.slice((page - 1) * limit, page * limit);

    return ok(res, {
      citas: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    return serverError(res, "getAllCitas", error);
  }
};

export const getDashboard = async (req, res) => {
  try {
    const stats = await citaModel.getDashboardStats();
    return ok(res, { dashboard: stats });
  } catch (error) {
    return serverError(res, "getDashboard", error);
  }
};

export const getDistribucionHoraria = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const distribucion = await citaModel.getDistribucionCitasPorHora(
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { distribucion });
  } catch (error) {
    return serverError(res, "getDistribucionHoraria", error);
  }
};

export const getReporteIngresos = async (req, res) => {
  try {
    const { periodo = "mes", fecha_inicio, fecha_fin } = req.query;
    if (!["dia", "mes", "año"].includes(periodo)) {
      return badRequest(res, "Período no válido. Use: dia, mes, año");
    }
    if (!fecha_inicio || !fecha_fin) {
      return badRequest(res, "Se requiere fecha_inicio y fecha_fin");
    }
    const reporte = await citaModel.getReporteIngresos(
      periodo,
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { periodo, fecha_inicio, fecha_fin, reporte });
  } catch (error) {
    return serverError(res, "getReporteIngresos", error);
  }
};

export const getServiciosTop = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite = 5 } = req.query;
    const limiteNum = Math.min(Math.max(parseInt(limite) || 5, 1), 50);
    const servicios = await citaModel.getServiciosMasSolicitados(
      fecha_inicio,
      fecha_fin,
      limiteNum,
    );
    return ok(res, { servicios });
  } catch (error) {
    return serverError(res, "getServiciosTop", error);
  }
};

export const getClientesTop = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite = 10 } = req.query;
    const limiteNum = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
    const clientes = await citaModel.getClientesMasFrecuentes(
      fecha_inicio,
      fecha_fin,
      limiteNum,
    );
    return ok(res, { clientes });
  } catch (error) {
    return serverError(res, "getClientesTop", error);
  }
};

export const getTasaCancelacion = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const reporte = await citaModel.getTasaCancelacionPorBarbero(
      fecha_inicio,
      fecha_fin,
    );
    return ok(res, { reporte });
  } catch (error) {
    return serverError(res, "getTasaCancelacion", error);
  }
};

export const editarCitaAdmin = async (req, res) => {
  try {
    const resultado = await citaService.editarCitaAdmin({
      citaId: req.params.id,
      campos: req.body,
    });
    return manejarResultado(res, resultado, ({ cita }) =>
      ok(res, { message: "Cita actualizada exitosamente", cita }),
    );
  } catch (error) {
    return serverError(res, "editarCitaAdmin", error);
  }
};

export default {
  agendarCita,
  getMisCitas,
  getProximasCitas,
  getHistorialCitas,
  reagendarCita,
  cancelarCita,
  getCitaById,
  getAgendaDia,
  getResumenCitas,
  getAgendaSemana,
  getCitasBarbero,
  getHorariosDisponibles,
  actualizarEstadoCita,
  confirmarCita,
  finalizarCita,
  verificarDisponibilidad,
  crearCitaAdmin,
  getAllCitas,
  getDashboard,
  getDistribucionHoraria,
  getReporteIngresos,
  getServiciosTop,
  getClientesTop,
  getTasaCancelacion,
  editarCitaAdmin,
};
