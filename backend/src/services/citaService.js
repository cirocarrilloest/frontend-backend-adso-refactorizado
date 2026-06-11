// src/services/citaService.js
/**
 * Capa de servicio para citas.
 * Contiene toda la lógica de negocio que antes vivía mezclada en citaController.js.
 *
 * RESPONSABILIDADES:
 *   - Orquestar validaciones de negocio (barbero válido, servicio activo, horario laboral)
 *   - Coordinar acceso a datos (citaModel, servicioModel, userModel)
 *   - Crear notificaciones como efecto secundario de las operaciones
 *
 * NO RESPONSABLE DE:
 *   - Leer req.body / req.params (eso es del controller)
 *   - Escribir res.json() (eso es del controller)
 *   - SQL directo (eso es del model/repository)
 */

import citaModel from "../models/citaModel.js";
import * as servicioModel from "../models/servicioModel.js";
import { getUserById } from "../models/userModel.js";
import { crearNotificacion } from "../models/notificacionModel.js";
import { getPool } from "../config/db.js";
import { validarFechaHoraFutura, normalizarFecha } from "../utils/dateUtils.js";

// ─── Helpers internos ───────────────────────────────────────────────────────

const ESTADOS_VALIDOS = ["pendiente", "confirmada", "completada", "cancelada"];

/**
 * Verifica que el ID hace referencia a un barbero existente.
 * Reutilizada en varios métodos del service.
 */
const verificarBarbero = async (barberoId) => {
  const barbero = await getUserById(barberoId);
  if (!barbero || barbero.rol !== "barbero") {
    return { error: "El barbero seleccionado no es válido" };
  }
  return { barbero };
};

/**
 * Verifica que el ID hace referencia a un servicio activo.
 */
const verificarServicio = async (servicioId) => {
  const servicio = await servicioModel.getServicioById(servicioId);
  if (!servicio || !servicio.activo) {
    return { error: "El servicio seleccionado no está disponible" };
  }
  return { servicio };
};

// ─── Operaciones de cliente ──────────────────────────────────────────────────

/**
 * Crea una nueva cita.
 * Antes: toda esta lógica estaba en agendarCita() del controller.
 */
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

/**
 * Reagenda una cita existente.
 */
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

/**
 * Cancela una cita con verificación de permisos por rol.
 */
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

/**
 * Obtiene los horarios disponibles para un barbero en una fecha,
 * filtrando los slots pasados si la fecha es hoy.
 */
export const getHorariosDisponibles = async ({
  barberoId,
  fecha,
  duracionSlot = 30,
}) => {
  const { barbero, error } = await verificarBarbero(barberoId);
  if (error) return { notFound: error };

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

/**
 * Actualiza el estado de una cita con verificación de permisos.
 */
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

/**
 * Confirma una cita pendiente y notifica al cliente.
 */
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

/**
 * Finaliza una cita confirmada y notifica al cliente.
 */
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

/**
 * Crea una cita en nombre de cualquier cliente (flujo admin).
 */
export const crearCitaAdmin = async ({
  clienteId,
  barberoId,
  servicioId,
  fecha,
  hora,
  notas,
}) => {
  const pool = getPool();

  const [clientes] = await pool.execute(
    "SELECT id, nombre, email FROM usuarios WHERE id = ? AND rol = 'cliente'",
    [clienteId],
  );
  if (clientes.length === 0)
    return { notFound: "Cliente no encontrado o no es un cliente válido" };

  const [barberos] = await pool.execute(
    "SELECT id, nombre FROM usuarios WHERE id = ? AND rol = 'barbero'",
    [barberoId],
  );
  if (barberos.length === 0) return { notFound: "Barbero no encontrado" };

  const [servicios] = await pool.execute(
    "SELECT id, nombre, duracion, precio FROM servicios WHERE id = ? AND activo = TRUE",
    [servicioId],
  );
  if (servicios.length === 0)
    return { notFound: "Servicio no encontrado o inactivo" };

  const errorFecha = validarFechaHoraFutura(fecha, hora);
  if (errorFecha) return { error: errorFecha.message };

  const [ocupado] = await pool.execute(
    "SELECT id FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND estado NOT IN ('cancelada')",
    [barberoId, fecha, hora],
  );
  if (ocupado.length > 0)
    return { error: "El horario seleccionado no está disponible" };

  const [result] = await pool.execute(
    "INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, estado, notas, created_at) VALUES (?, ?, ?, ?, ?, 'confirmada', ?, NOW())",
    [clienteId, barberoId, servicioId, fecha, hora, notas || null],
  );

  const [citaCreada] = await pool.execute(
    `SELECT c.id, c.fecha, c.hora, c.estado, c.notas, c.created_at,
            s.id as servicio_id, s.nombre as servicio_nombre, s.duracion, s.precio,
            u.id as cliente_id, u.nombre as cliente_nombre, u.email as cliente_email,
            b.id as barbero_id, b.nombre as barbero_nombre
     FROM citas c
     INNER JOIN servicios s ON c.servicio_id = s.id
     INNER JOIN usuarios u ON c.cliente_id = u.id
     INNER JOIN usuarios b ON c.barbero_id = b.id
     WHERE c.id = ?`,
    [result.insertId],
  );

  await crearNotificacion(
    clienteId,
    "cita_nueva",
    "Cita agendada por administrador",
    `El administrador agendó tu cita de ${servicios[0].nombre} el ${fecha} a las ${hora} con ${barberos[0].nombre}`,
    { citaId: result.insertId },
  );

  await crearNotificacion(
    barberoId,
    "cita_nueva",
    "Nueva cita asignada",
    `Se te ha asignado una nueva cita de ${clientes[0].nombre} el ${fecha} a las ${hora} - ${servicios[0].nombre}`,
    { citaId: result.insertId },
  );

  return { cita: citaCreada[0] };
};

/**
 * Edita una cita completa como administrador con notificaciones automáticas.
 */
export const editarCitaAdmin = async ({ citaId, campos }) => {
  const pool = getPool();

  const [citaExistente] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre FROM citas c LEFT JOIN usuarios u ON c.cliente_id = u.id WHERE c.id = ?`,
    [citaId],
  );
  if (!citaExistente[0]) return { notFound: "Cita no encontrada" };

  const original = citaExistente[0];
  const { fecha, hora, barbero_id, servicio_id, notas, estado } = campos;

  if (fecha || hora) {
    const errorFecha = validarFechaHoraFutura(
      fecha || original.fecha,
      hora || original.hora,
    );
    if (errorFecha) return { error: errorFecha.message };
  }

  if (barbero_id !== undefined || fecha !== undefined || hora !== undefined) {
    const [dup] = await pool.execute(
      "SELECT id FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND id != ? AND estado NOT IN ('cancelada')",
      [
        barbero_id ?? original.barbero_id,
        fecha ?? original.fecha,
        hora ?? original.hora,
        citaId,
      ],
    );
    if (dup.length > 0)
      return { conflict: "El barbero ya tiene una cita en ese horario" };
  }

  const updates = [];
  const params = [];
  if (fecha !== undefined) {
    updates.push("fecha = ?");
    params.push(fecha);
  }
  if (hora !== undefined) {
    updates.push("hora = ?");
    params.push(hora);
  }
  if (barbero_id !== undefined) {
    updates.push("barbero_id = ?");
    params.push(barbero_id);
  }
  if (servicio_id !== undefined) {
    updates.push("servicio_id = ?");
    params.push(servicio_id);
  }
  if (notas !== undefined) {
    updates.push("notas = ?");
    params.push(notas ?? null);
  }
  if (estado !== undefined && estado !== original.estado) {
    updates.push("estado = ?");
    params.push(estado);
  }

  if (updates.length === 0) return { error: "No hay campos para actualizar" };

  updates.push("updated_at = NOW()");
  params.push(citaId);
  await pool.execute(
    `UPDATE citas SET ${updates.join(", ")} WHERE id = ?`,
    params,
  );

  // Notificaciones de cambios importantes
  if ((fecha || hora) && original.cliente_id) {
    const nuevaFecha = fecha ?? original.fecha;
    const nuevaHora = hora ?? original.hora;
    await crearNotificacion(
      original.cliente_id,
      "cita_editada_admin",
      "Tu cita fue modificada",
      `Tu cita ha sido modificada. Nueva fecha: ${nuevaFecha} a las ${String(nuevaHora).substring(0, 5)}`,
      { citaId, cambios: { fecha, hora, barbero_id, estado } },
    );
  }

  if (barbero_id !== undefined && barbero_id !== original.barbero_id) {
    if (original.barbero_id) {
      await crearNotificacion(
        original.barbero_id,
        "cita_editada_admin",
        "Cita reasignada",
        `La cita #${citaId} ya no está asignada a ti`,
        { citaId },
      );
    }
    if (barbero_id) {
      await crearNotificacion(
        barbero_id,
        "cita_editada_admin",
        "Nueva cita asignada",
        `Se te ha asignado una cita para el ${fecha ?? original.fecha} a las ${String(hora ?? original.hora).substring(0, 5)}`,
        { citaId },
      );
    }
  }

  const [citaActualizada] = await pool.execute(
    `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email,
            b.nombre as barbero_nombre, s.nombre as servicio_nombre, s.duracion, s.precio
     FROM citas c
     LEFT JOIN usuarios u ON c.cliente_id = u.id
     LEFT JOIN usuarios b ON c.barbero_id = b.id
     LEFT JOIN servicios s ON c.servicio_id = s.id
     WHERE c.id = ?`,
    [citaId],
  );

  return { cita: citaActualizada[0] };
};
