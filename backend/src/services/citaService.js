// src/services/citaService.js
// VERSIÓN COMPLETA Y REFACTORIZADA - SIN SQL DIRECTO

import citaModel from "../models/citaModel.js";
import servicioRepository from "../repositories/servicioRepository.js";
import userRepository from "../repositories/userRepository.js";
import { crearNotificacion } from "../models/notificacionModel.js";
import { validarFechaHoraFutura, normalizarFecha } from "../utils/dateUtils.js";

const ESTADOS_VALIDOS = ["pendiente", "confirmada", "completada", "cancelada"];

// ─── Helpers internos ───────────────────────────────────────────────────────

const verificarBarbero = async (barberoId) => {
  const barbero = await userRepository.findById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    return { error: "El barbero seleccionado no es válido" };
  }
  return { barbero };
};

const verificarServicio = async (servicioId) => {
  const servicio = await servicioRepository.findById(servicioId);
  if (!servicio || !servicio.activo) {
    return { error: "El servicio seleccionado no está disponible" };
  }
  return { servicio };
};

// ─── Operaciones de cliente ──────────────────────────────────────────────────

export const agendarCita = async ({
  clienteId,
  barberoId,
  servicioId,
  fecha,
  hora,
  notas,
  clienteNombre,
}) => {
  const fechaNorm = normalizarFecha(fecha);

  const errorFecha = validarFechaHoraFutura(fechaNorm, hora);
  if (errorFecha) return { error: errorFecha.message };

  const { barbero, error: errorBarbero } = await verificarBarbero(barberoId);
  if (errorBarbero) return { error: errorBarbero };

  const { servicio, error: errorServicio } =
    await verificarServicio(servicioId);
  if (errorServicio) return { error: errorServicio };

  const enHorario = await citaModel.verificarHorarioLaboral(
    barberoId,
    fechaNorm,
    hora,
  );
  if (!enHorario) {
    return {
      error:
        "El horario seleccionado está fuera de la jornada laboral del barbero",
    };
  }

  const duplicado = await citaModel.verificarDuplicado(
    barberoId,
    fechaNorm,
    hora,
  );
  if (duplicado) {
    return { conflict: "El barbero ya tiene una cita agendada en ese horario" };
  }

  const nuevaCita = await citaModel.createCita({
    cliente_id: clienteId,
    barbero_id: barberoId,
    servicio_id: servicioId,
    fecha: fechaNorm,
    hora,
    notas,
  });

  await crearNotificacion(
    barberoId,
    "cita_nueva",
    "Nueva cita agendada",
    `${clienteNombre} ha agendado ${servicio.nombre} para el ${fechaNorm} a las ${hora}`,
    { citaId: nuevaCita.id, cliente: clienteNombre, servicio: servicio.nombre },
  );

  return { cita: nuevaCita };
};

export const reagendarCita = async ({
  citaId,
  fecha,
  hora,
  usuarioId,
  usuarioRol,
}) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  if (usuarioRol === "cliente" && cita.cliente_id !== usuarioId) {
    return { forbidden: "No tienes permiso para reagendar esta cita" };
  }

  if (cita.estado !== "pendiente") {
    return {
      error: `No se puede reagendar una cita en estado "${cita.estado}"`,
    };
  }

  const errorFecha = validarFechaHoraFutura(fecha, hora);
  if (errorFecha) return { error: errorFecha.message };

  const duplicado = await citaModel.verificarDuplicado(
    cita.barbero_id,
    fecha,
    hora,
  );
  if (duplicado)
    return { conflict: "El barbero ya tiene una cita en ese horario" };

  const citaActualizada = await citaModel.updateCita(citaId, {
    fecha,
    hora,
    notas: cita.notas,
  });

  await crearNotificacion(
    cita.barbero_id,
    "sistema",
    "Cita reagendada",
    `La cita de ${cita.cliente_nombre} ha sido reagendada para el ${fecha} a las ${hora}`,
    { citaId },
  );

  return { cita: citaActualizada };
};

export const cancelarCita = async ({
  citaId,
  usuarioId,
  usuarioRol,
  usuarioNombre,
}) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  if (usuarioRol === "cliente" && cita.cliente_id !== usuarioId) {
    return { forbidden: "No tienes permiso para cancelar esta cita" };
  }
  if (usuarioRol === "barbero" && cita.barbero_id !== usuarioId) {
    return { forbidden: "No tienes permiso para cancelar esta cita" };
  }

  const citaCancelada = await citaModel.cancelarCita(citaId);

  if (usuarioRol === "cliente") {
    await crearNotificacion(
      cita.barbero_id,
      "cita_cancelada",
      "Cita cancelada por el cliente",
      `${usuarioNombre} ha cancelado la cita del ${cita.fecha} a las ${cita.hora}`,
      { citaId },
    );
  } else if (usuarioRol === "barbero") {
    await crearNotificacion(
      cita.cliente_id,
      "cita_cancelada",
      "Cita cancelada por el barbero",
      `El barbero ha cancelado tu cita del ${cita.fecha} a las ${cita.hora}`,
      { citaId },
    );
  }

  return { cita: citaCancelada };
};

// ─── Operaciones de barbero/admin ────────────────────────────────────────────

export const getHorariosDisponibles = async ({
  barberoId,
  fecha,
  duracionSlot = 30,
}) => {
  const barbero = await userRepository.findById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    return { notFound: "Barbero no encontrado" };
  }

  const disponibles = await citaModel.getHorariosDisponibles(
    barberoId,
    fecha,
    duracionSlot,
  );

  const { fechaHoyStr, horaActualStr } = await import("../utils/dateUtils.js");
  const hoy = fechaHoyStr();

  const slotsFiltrados =
    fecha === hoy
      ? disponibles.filter((slot) => slot > horaActualStr())
      : disponibles;

  return { horarios: slotsFiltrados, barbero };
};

export const actualizarEstadoCita = async ({
  citaId,
  estado,
  usuarioId,
  usuarioRol,
}) => {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return { error: "Estado no válido" };
  }

  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  if (
    usuarioRol === "barbero" &&
    parseInt(cita.barbero_id) !== parseInt(usuarioId)
  ) {
    return { forbidden: "No tienes permiso para modificar esta cita" };
  }

  const citaActualizada = await citaModel.updateCitaEstado(citaId, estado);
  return { cita: citaActualizada };
};

export const confirmarCita = async ({ citaId, usuarioId, usuarioRol }) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  if (
    usuarioRol === "barbero" &&
    parseInt(cita.barbero_id) !== parseInt(usuarioId)
  ) {
    return { forbidden: "No tienes permiso para confirmar esta cita" };
  }

  if (cita.estado !== "pendiente") {
    return {
      error: `No se puede confirmar una cita en estado "${cita.estado}"`,
    };
  }

  const citaConfirmada = await citaModel.updateCitaEstado(citaId, "confirmada");

  await crearNotificacion(
    cita.cliente_id,
    "cita_confirmada",
    "Cita confirmada",
    `Tu cita del ${cita.fecha} a las ${cita.hora} ha sido confirmada por el barbero`,
    { citaId },
  );

  return { cita: citaConfirmada };
};

export const finalizarCita = async ({ citaId, usuarioId, usuarioRol }) => {
  const cita = await citaModel.getCitaById(citaId);
  if (!cita) return { notFound: "Cita no encontrada" };

  if (
    usuarioRol === "barbero" &&
    parseInt(cita.barbero_id) !== parseInt(usuarioId)
  ) {
    return { forbidden: "No tienes permiso para finalizar esta cita" };
  }

  const citaFinalizada = await citaModel.updateCitaEstado(citaId, "completada");

  await crearNotificacion(
    cita.cliente_id,
    "sistema",
    "✨ Cita completada",
    `Tu cita del ${cita.fecha} ha sido marcada como completada. ¡Gracias por visitarnos!`,
    { citaId },
  );

  return { cita: citaFinalizada };
};

// ─── Operaciones de administrador ───────────────────────────────────────────

export const crearCitaAdmin = async ({
  clienteId,
  barberoId,
  servicioId,
  fecha,
  hora,
  notas,
}) => {
  // Validar cliente
  const cliente = await userRepository.findById(clienteId);
  if (!cliente || cliente.rol !== "cliente") {
    return { notFound: "Cliente no encontrado o no es un cliente válido" };
  }

  // Validar barbero
  const barbero = await userRepository.findById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    return { notFound: "Barbero no encontrado" };
  }

  // Validar servicio
  const servicio = await servicioRepository.findById(servicioId);
  if (!servicio || !servicio.activo) {
    return { notFound: "Servicio no encontrado o inactivo" };
  }

  const errorFecha = validarFechaHoraFutura(fecha, hora);
  if (errorFecha) return { error: errorFecha.message };

  // Verificar disponibilidad
  const duplicado = await citaModel.verificarDuplicado(barberoId, fecha, hora);
  if (duplicado) return { error: "El horario seleccionado no está disponible" };

  // Crear cita (confirmada directamente por admin)
  const citaCreada = await citaModel.createCita({
    cliente_id: clienteId,
    barbero_id: barberoId,
    servicio_id: servicioId,
    fecha,
    hora,
    notas,
    estado: "confirmada",
  });

  // Notificaciones
  await crearNotificacion(
    clienteId,
    "cita_nueva",
    "Cita agendada por administrador",
    `El administrador agendó tu cita de ${servicio.nombre} el ${fecha} a las ${hora} con ${barbero.nombre}`,
    { citaId: citaCreada.id },
  );

  await crearNotificacion(
    barberoId,
    "cita_nueva",
    "Nueva cita asignada",
    `Se te ha asignado una nueva cita de ${cliente.nombre} el ${fecha} a las ${hora} - ${servicio.nombre}`,
    { citaId: citaCreada.id },
  );

  return { cita: citaCreada };
};

export const editarCitaAdmin = async ({ citaId, campos }) => {
  const citaExistente = await citaModel.getCitaById(citaId);
  if (!citaExistente) return { notFound: "Cita no encontrada" };

  // Validar fecha si se está cambiando
  if (campos.fecha || campos.hora) {
    const errorFecha = validarFechaHoraFutura(
      campos.fecha || citaExistente.fecha,
      campos.hora || citaExistente.hora,
    );
    if (errorFecha) return { error: errorFecha.message };
  }

  // Verificar duplicado si cambia barbero/fecha/hora
  if (
    campos.barbero_id !== undefined ||
    campos.fecha !== undefined ||
    campos.hora !== undefined
  ) {
    const duplicado = await citaModel.verificarDuplicado(
      campos.barbero_id ?? citaExistente.barbero_id,
      campos.fecha ?? citaExistente.fecha,
      campos.hora ?? citaExistente.hora,
      citaId,
    );
    if (duplicado)
      return { conflict: "El barbero ya tiene una cita en ese horario" };
  }

  // Actualizar cita
  const citaActualizada = await citaModel.updateCitaAdmin(citaId, campos);

  // Notificaciones de cambios importantes
  if ((campos.fecha || campos.hora) && citaExistente.cliente_id) {
    await crearNotificacion(
      citaExistente.cliente_id,
      "cita_editada_admin",
      "Tu cita fue modificada",
      `Tu cita ha sido modificada. Nueva fecha: ${campos.fecha || citaExistente.fecha} a las ${String(campos.hora || citaExistente.hora).substring(0, 5)}`,
      { citaId, cambios: campos },
    );
  }

  if (
    campos.barbero_id !== undefined &&
    campos.barbero_id !== citaExistente.barbero_id
  ) {
    if (citaExistente.barbero_id) {
      await crearNotificacion(
        citaExistente.barbero_id,
        "cita_editada_admin",
        "Cita reasignada",
        `La cita #${citaId} ya no está asignada a ti`,
        { citaId },
      );
    }
    if (campos.barbero_id) {
      const nuevoBarbero = await userRepository.findById(campos.barbero_id);
      if (nuevoBarbero) {
        await crearNotificacion(
          campos.barbero_id,
          "cita_editada_admin",
          "Nueva cita asignada",
          `Se te ha asignado una cita para el ${campos.fecha || citaExistente.fecha} a las ${String(campos.hora || citaExistente.hora).substring(0, 5)}`,
          { citaId },
        );
      }
    }
  }

  return { cita: citaActualizada };
};
