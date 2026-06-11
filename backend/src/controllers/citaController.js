// backend/src/controllers/citaController.js

import citaModel from "../models/citaModel.js";
import * as servicioModel from "../models/servicioModel.js";
import { getUserById } from "../models/userModel.js";
import { crearNotificacion } from "../models/notificacionModel.js";
import { getPool } from "../config/db.js";
import { validarAntelacionCancelacion } from "../middlewares/dateValidationMiddleware.js";

// helper interno

/**
 * Retorna { ok: false, message } si fecha+hora están en el pasado.
 * Retorna null si todo está bien.
 */
function validarFechaHoraFutura(fecha, hora) {
  const ahora = new Date();
  const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;

  // Fecha anterior a hoy
  if (fecha < hoyStr) {
    return {
      ok: false,
      message: `No se puede agendar en una fecha pasada (${fecha})`,
    };
  }

  // Misma fecha pero hora pasada
  if (fecha === hoyStr && hora) {
    const horaActualStr = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    const horaNorm = String(hora).slice(0, 5);
    if (horaNorm <= horaActualStr) {
      return {
        ok: false,
        message: `No se puede agendar a una hora que ya pasó. Hora actual: ${horaActualStr}`,
      };
    }
  }

  return null;
}

// helper servicio

const getServicioById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    "SELECT id, nombre, duracion, precio FROM servicios WHERE id = ?",
    [id],
  );
  return rows[0] || null;
};

// FUNCIONES PARA CLIENTES

/** Agendar nueva cita */
export const agendarCita = async (req, res) => {
  try {
    const { barbero_id, servicio_id, fecha, hora, notas } = req.body;
    const cliente_id = req.usuario.id;

    if (req.usuario.rol !== "cliente" && req.usuario.rol !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Solo los clientes pueden agendar citas",
      });
    }

    if (!barbero_id || !servicio_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message:
          "Faltan campos requeridos: barbero_id, servicio_id, fecha, hora",
      });
    }

    // Normalizar fecha
    let fechaNormalizada = fecha;
    if (fecha.includes("T")) {
      fechaNormalizada = fecha.split("T")[0];
    }

    // FIX: validar fecha Y hora (no solo fecha)
    const errorFechaHora = validarFechaHoraFutura(fechaNormalizada, hora);
    if (errorFechaHora) {
      return res.status(400).json(errorFechaHora);
    }

    // Validar que el barbero existe
    const barbero = await getUserById(barbero_id);
    if (!barbero || barbero.rol !== "barbero") {
      return res.status(400).json({
        ok: false,
        message: "El barbero seleccionado no es válido",
      });
    }

    // Validar que el servicio existe y está activo
    const servicio = await servicioModel.getServicioById(servicio_id);
    if (!servicio || !servicio.activo) {
      return res.status(400).json({
        ok: false,
        message: "El servicio seleccionado no está disponible",
      });
    }

    // Verificar horario laboral
    const enHorarioLaboral = await citaModel.verificarHorarioLaboral(
      barbero_id,
      fechaNormalizada,
      hora,
    );
    if (!enHorarioLaboral) {
      return res.status(400).json({
        ok: false,
        message:
          "El horario seleccionado está fuera de la jornada laboral del barbero",
      });
    }

    // Verificar duplicación
    const duplicado = await citaModel.verificarDuplicado(
      barbero_id,
      fechaNormalizada,
      hora,
    );
    if (duplicado) {
      return res.status(409).json({
        ok: false,
        message: "El barbero ya tiene una cita agendada en ese horario",
      });
    }

    const nuevaCita = await citaModel.createCita({
      cliente_id,
      barbero_id,
      servicio_id,
      fecha: fechaNormalizada,
      hora,
      notas,
    });

    await crearNotificacion(
      barbero_id,
      "cita_nueva",
      "Nueva cita agendada",
      `${req.usuario.nombre} ha agendado ${servicio.nombre} para el ${fechaNormalizada} a las ${hora}`,
      {
        citaId: nuevaCita.id,
        cliente: req.usuario.nombre,
        servicio: servicio.nombre,
      },
    );

    res.status(201).json({
      ok: true,
      message: "Cita agendada exitosamente",
      cita: nuevaCita,
    });
  } catch (error) {
    console.error("Error al agendar cita:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener mis citas (cliente) */
export const getMisCitas = async (req, res) => {
  try {
    const citas = await citaModel.getCitasByCliente(req.usuario.id);
    res.json({ ok: true, citas });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener próximas citas (cliente) */
export const getProximasCitas = async (req, res) => {
  try {
    const citas = await citaModel.getProximasCitasByCliente(req.usuario.id);
    res.json({ ok: true, citas, total: citas.length });
  } catch (error) {
    console.error("Error al obtener próximas citas:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener historial de citas (cliente) */
export const getHistorialCitas = async (req, res) => {
  try {
    let { limite = 10 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 10;
    if (limiteNum > 100) limiteNum = 100;

    const citas = await citaModel.getHistorialCitasByCliente(
      req.usuario.id,
      limiteNum,
    );
    res.json({ ok: true, citas, total: citas.length, limite: limiteNum });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Reagendar cita */
export const reagendarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res
        .status(400)
        .json({ ok: false, message: "Se requiere fecha y hora" });
    }

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    // Validar permisos
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para reagendar esta cita",
      });
    }

    // Solo citas pendientes
    if (cita.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        message: `No se puede reagendar una cita en estado "${cita.estado}"`,
      });
    }

    // FIX: validar fecha Y hora (no solo fecha)
    const errorFechaHora = validarFechaHoraFutura(fecha, hora);
    if (errorFechaHora) {
      return res.status(400).json(errorFechaHora);
    }

    // Verificar disponibilidad (excluye la misma cita)
    const duplicado = await citaModel.verificarDuplicado(
      cita.barbero_id,
      fecha,
      hora,
    );
    if (duplicado) {
      return res.status(409).json({
        ok: false,
        message: "El barbero ya tiene una cita en ese horario",
      });
    }

    const citaActualizada = await citaModel.updateCita(id, {
      fecha,
      hora,
      notas: cita.notas,
    });

    await crearNotificacion(
      cita.barbero_id,
      "sistema",
      "Cita reagendada",
      `La cita de ${cita.cliente_nombre} ha sido reagendada para el ${fecha} a las ${hora}`,
      { citaId: id },
    );

    res.json({
      ok: true,
      message: "Cita reagendada exitosamente",
      cita: citaActualizada,
    });
  } catch (error) {
    console.error("Error al reagendar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

/** Cancelar cita */
export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await citaModel.getCitaById(id);

    if (!cita) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return res
        .status(403)
        .json({
          ok: false,
          message: "No tienes permiso para cancelar esta cita",
        });
    }
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res
        .status(403)
        .json({
          ok: false,
          message: "No tienes permiso para cancelar esta cita",
        });
    }

    const citaCancelada = await citaModel.cancelarCita(id);

    if (req.usuario.rol === "cliente") {
      await crearNotificacion(
        cita.barbero_id,
        "cita_cancelada",
        "Cita cancelada por el cliente",
        `${req.usuario.nombre} ha cancelado la cita del ${cita.fecha} a las ${cita.hora}`,
        { citaId: id },
      );
    } else if (req.usuario.rol === "barbero") {
      await crearNotificacion(
        cita.cliente_id,
        "cita_cancelada",
        "Cita cancelada por el barbero",
        `El barbero ha cancelado tu cita del ${cita.fecha} a las ${cita.hora}`,
        { citaId: id },
      );
    }

    res.json({
      ok: true,
      message: "Cita cancelada exitosamente",
      cita: citaCancelada,
    });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener cita por ID */
export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await citaModel.getCitaById(id);

    if (!cita) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return res
        .status(403)
        .json({ ok: false, message: "No tienes permiso para ver esta cita" });
    }
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res
        .status(403)
        .json({ ok: false, message: "No tienes permiso para ver esta cita" });
    }

    res.json({ ok: true, cita });
  } catch (error) {
    console.error("Error al obtener cita:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// FUNCIONES PARA BARBEROS/ADMIN

/** Obtener agenda del día */
export const getAgendaDia = async (req, res) => {
  try {
    const { fecha } = req.query;
    let barbero_id = req.usuario.id;

    if (req.usuario.rol === "admin" && req.query.barbero_id) {
      barbero_id = req.query.barbero_id;
    }

    const citas = await citaModel.getAgendaDiaByBarbero(barbero_id, fecha);
    res.json({
      ok: true,
      fecha: fecha || new Date().toISOString().split("T")[0],
      citas,
      total_citas: citas.length,
    });
  } catch (error) {
    console.error("Error al obtener agenda del día:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener resumen de citas por estado */
export const getResumenCitas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const resumen = await citaModel.getResumenCitasByBarbero(
      req.usuario.id,
      fecha_inicio,
      fecha_fin,
    );
    res.json({ ok: true, resumen });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener agenda semanal */
export const getAgendaSemana = async (req, res) => {
  try {
    const { id: barbero_id } = req.params;
    const { fecha_inicio } = req.query;
    const fecha = fecha_inicio || new Date().toISOString().split("T")[0];

    if (
      req.usuario.rol === "barbero" &&
      parseInt(barbero_id) !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver la agenda de otro barbero",
      });
    }

    const resultado = await citaModel.getCitasSemanaByBarbero(
      barbero_id,
      fecha,
    );
    res.json({
      ok: true,
      ...resultado,
      total_citas: Object.values(resultado.agenda).flat().length,
    });
  } catch (error) {
    console.error("Error al obtener agenda semanal:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener citas de un barbero */
export const getCitasBarbero = async (req, res) => {
  try {
    const { barbero_id } = req.params;
    const { fecha } = req.query;

    if (req.usuario.rol === "admin" && !barbero_id) {
      const filtros = {};
      if (fecha) filtros.fecha = fecha;
      const citas = await citaModel.getAllCitas(filtros);
      return res.json({ ok: true, citas });
    }

    if (req.usuario.rol === "barbero") {
      const citas = await citaModel.getCitasByBarbero(req.usuario.id, fecha);
      return res.json({ ok: true, citas });
    }

    if (req.usuario.rol === "admin" && barbero_id) {
      const citas = await citaModel.getCitasByBarbero(barbero_id, fecha);
      return res.json({ ok: true, citas });
    }

    return res.status(400).json({ ok: false, message: "Parámetros inválidos" });
  } catch (error) {
    console.error("Error al obtener citas del barbero:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Obtener horarios disponibles */
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { id: barbero_id } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere el parámetro fecha (YYYY-MM-DD)",
      });
    }

    const barbero = await getUserById(barbero_id);
    if (!barbero || barbero.rol !== "barbero") {
      return res
        .status(404)
        .json({ ok: false, message: "Barbero no encontrado" });
    }

    const config = req.config || {};
    const duracionSlot = parseInt(config.duracion_slot?.valor || 30);

    const disponibles = await citaModel.getHorariosDisponibles(
      barbero_id,
      fecha,
      duracionSlot,
    );

    // FIX: si la fecha es hoy, filtrar slots que ya pasaron
    let slotsFiltrados = disponibles;
    const ahora = new Date();
    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;

    if (fecha === hoyStr) {
      const horaActualStr = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
      slotsFiltrados = disponibles.filter((slot) => slot > horaActualStr);
    }

    res.json({
      ok: true,
      barbero_id,
      fecha,
      duracion_slot: duracionSlot,
      horarios_disponibles: slotsFiltrados,
      total_disponibles: slotsFiltrados.length,
    });
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Actualizar estado de cita */
export const actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      "pendiente",
      "confirmada",
      "completada",
      "cancelada",
    ];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ ok: false, message: "Estado no válido" });
    }

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    // FIX: comparar como números para evitar fallo cuando barbero_id es int y req.usuario.id es string
    if (
      req.usuario.rol === "barbero" &&
      parseInt(cita.barbero_id) !== parseInt(req.usuario.id)
    ) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para modificar esta cita",
      });
    }

    const citaActualizada = await citaModel.updateCitaEstado(id, estado);
    res.json({
      ok: true,
      message: "Estado de la cita actualizado",
      cita: citaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Confirmar cita */
export const confirmarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await citaModel.getCitaById(id);

    if (!cita) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    // FIX: comparación numérica para evitar mismatch int vs string
    if (
      req.usuario.rol === "barbero" &&
      parseInt(cita.barbero_id) !== parseInt(req.usuario.id)
    ) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para confirmar esta cita",
      });
    }

    if (cita.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        message: `No se puede confirmar una cita en estado "${cita.estado}"`,
      });
    }

    const citaConfirmada = await citaModel.updateCitaEstado(id, "confirmada");

    await crearNotificacion(
      cita.cliente_id,
      "cita_confirmada",
      "Cita confirmada",
      `Tu cita del ${cita.fecha} a las ${cita.hora} ha sido confirmada por el barbero`,
      { citaId: id },
    );

    res.json({
      ok: true,
      message: "Cita confirmada exitosamente",
      cita: citaConfirmada,
    });
  } catch (error) {
    console.error("Error al confirmar cita:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Finalizar cita */
export const finalizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await citaModel.getCitaById(id);

    if (!cita) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    // FIX: comparación numérica
    if (
      req.usuario.rol === "barbero" &&
      parseInt(cita.barbero_id) !== parseInt(req.usuario.id)
    ) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para finalizar esta cita",
      });
    }

    const citaFinalizada = await citaModel.updateCitaEstado(id, "completada");

    await crearNotificacion(
      cita.cliente_id,
      "sistema",
      "✨ Cita completada",
      `Tu cita del ${cita.fecha} ha sido marcada como completada. ¡Gracias por visitarnos!`,
      { citaId: id },
    );

    res.json({
      ok: true,
      message: "Cita finalizada exitosamente",
      cita: citaFinalizada,
    });
  } catch (error) {
    console.error("Error al finalizar cita:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Verificar disponibilidad puntual */
export const verificarDisponibilidad = async (req, res) => {
  try {
    const { barbero_id, fecha, hora } = req.query;

    if (!barbero_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere barbero_id, fecha y hora",
      });
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

    res.json({ ok: true, disponible, horarios_ocupados: horariosOcupados });
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// FUNCIONES PARA ADMIN

/** Crear cita como administrador */
export const crearCitaAdmin = async (req, res) => {
  try {
    const pool = getPool();
    const {
      cliente_id,
      barbero_id,
      servicio_id,
      fecha,
      hora,
      notas = null,
    } = req.body;

    if (!cliente_id || !barbero_id || !servicio_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message:
          "Todos los campos son requeridos: cliente_id, barbero_id, servicio_id, fecha, hora",
      });
    }

    const clienteId = parseInt(cliente_id);
    const barberoId = parseInt(barbero_id);
    const servicioId = parseInt(servicio_id);

    if (isNaN(clienteId) || isNaN(barberoId) || isNaN(servicioId)) {
      return res
        .status(400)
        .json({ ok: false, message: "Los IDs deben ser números válidos" });
    }

    const [cliente] = await pool.execute(
      "SELECT id, nombre, email FROM usuarios WHERE id = ? AND rol = 'cliente'",
      [clienteId],
    );
    if (cliente.length === 0) {
      return res
        .status(404)
        .json({
          ok: false,
          message: "Cliente no encontrado o no es un cliente válido",
        });
    }

    const [barbero] = await pool.execute(
      "SELECT id, nombre FROM usuarios WHERE id = ? AND rol = 'barbero'",
      [barberoId],
    );
    if (barbero.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Barbero no encontrado" });
    }

    const [servicio] = await pool.execute(
      "SELECT id, nombre, duracion, precio FROM servicios WHERE id = ? AND activo = TRUE",
      [servicioId],
    );
    if (servicio.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Servicio no encontrado o inactivo" });
    }

    // FIX: validar fecha Y hora (no solo fecha)
    const errorFechaHora = validarFechaHoraFutura(fecha, hora);
    if (errorFechaHora) {
      return res.status(400).json(errorFechaHora);
    }

    const [horarioOcupado] = await pool.execute(
      `SELECT id FROM citas 
       WHERE barbero_id = ? AND fecha = ? AND hora = ? 
       AND estado NOT IN ('cancelada')`,
      [barberoId, fecha, hora],
    );
    if (horarioOcupado.length > 0) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "El horario seleccionado no está disponible",
        });
    }

    const [result] = await pool.execute(
      `INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, estado, notas, created_at)
       VALUES (?, ?, ?, ?, ?, 'confirmada', ?, NOW())`,
      [clienteId, barberoId, servicioId, fecha, hora, notas],
    );

    await crearNotificacion(
      clienteId,
      "cita_nueva",
      "Cita agendada por administrador",
      `El administrador agendó tu cita de ${servicio[0].nombre} el ${fecha} a las ${hora} con ${barbero[0].nombre}`,
      { citaId: result.insertId },
    );

    await crearNotificacion(
      barberoId,
      "cita_nueva",
      "Nueva cita asignada",
      `Se te ha asignado una nueva cita de ${cliente[0].nombre} el ${fecha} a las ${hora} - ${servicio[0].nombre}`,
      { citaId: result.insertId },
    );

    const [citaCreada] = await pool.execute(
      `SELECT 
        c.id, c.fecha, c.hora, c.estado, c.notas, c.created_at,
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

    res.status(201).json({
      ok: true,
      message: "Cita creada exitosamente por el administrador",
      cita: citaCreada[0],
    });
  } catch (error) {
    console.error("Error al crear cita como admin:", error);
    res
      .status(500)
      .json({
        ok: false,
        message: "Error interno del servidor",
        error: error.message,
      });
  }
};

/** Obtener todas las citas (admin) con paginación y filtros */
export const getAllCitas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;

    let pageNum = parseInt(req.query.page, 10);
    let limitNum = parseInt(req.query.limit, 10);

    if (isNaN(pageNum) || pageNum <= 0) pageNum = 1;
    if (isNaN(limitNum) || limitNum <= 0) limitNum = 15;
    if (limitNum > 100) limitNum = 100;

    const offset = (pageNum - 1) * limitNum;
    const pool = getPool();

    let whereClause = "";
    const whereParams = [];

    if (estado && estado.trim() !== "") {
      whereClause += " AND c.estado = ?";
      whereParams.push(estado);
    }
    if (fecha_desde && fecha_desde.trim() !== "") {
      whereClause += " AND c.fecha >= ?";
      whereParams.push(fecha_desde);
    }
    if (fecha_hasta && fecha_hasta.trim() !== "") {
      whereClause += " AND c.fecha <= ?";
      whereParams.push(fecha_hasta);
    }

    const query = `
      SELECT 
        c.id, c.fecha, c.hora, c.estado, c.notas, c.created_at, c.updated_at,
        cli.id as cliente_id, cli.nombre as cliente_nombre, cli.email as cliente_email,
        bar.id as barbero_id, bar.nombre as barbero_nombre,
        s.id as servicio_id, s.nombre as servicio_nombre, s.duracion, s.precio
      FROM citas c
      LEFT JOIN usuarios cli ON c.cliente_id = cli.id
      LEFT JOIN usuarios bar ON c.barbero_id = bar.id
      LEFT JOIN servicios s ON c.servicio_id = s.id
      WHERE 1=1 ${whereClause}
      ORDER BY c.fecha DESC, c.hora DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const [rows] = await pool.execute(query, whereParams);
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas c WHERE 1=1 ${whereClause}`,
      whereParams,
    );

    const total = countResult[0].total;

    return res.json({
      ok: true,
      citas: rows,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    console.error("Error al obtener todas las citas:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Dashboard estadísticas */
export const getDashboard = async (req, res) => {
  try {
    const stats = await citaModel.getDashboardStats();
    res.json({
      ok: true,
      dashboard: {
        citas_hoy: stats.citas_hoy,
        citas_pendientes: stats.citas_pendientes,
        ingresos_mes: stats.ingresos_mes,
        clientes_totales: stats.clientes_totales,
        barberos_activos: stats.barberos_activos,
        tasa_ocupacion: stats.tasa_ocupacion,
      },
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Distribución horaria */
export const getDistribucionHoraria = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const distribucion = await citaModel.getDistribucionCitasPorHora(
      fecha_inicio,
      fecha_fin,
    );
    res.json({ ok: true, distribucion });
  } catch (error) {
    console.error("Error al obtener distribución horaria:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Reporte de ingresos */
export const getReporteIngresos = async (req, res) => {
  try {
    const { periodo = "mes", fecha_inicio, fecha_fin } = req.query;
    const periodosValidos = ["dia", "mes", "año"];

    if (!periodosValidos.includes(periodo)) {
      return res.status(400).json({
        ok: false,
        message: `Período no válido. Use: ${periodosValidos.join(", ")}`,
      });
    }
    if (!fecha_inicio || !fecha_fin) {
      return res
        .status(400)
        .json({ ok: false, message: "Se requiere fecha_inicio y fecha_fin" });
    }

    const reporte = await citaModel.getReporteIngresos(
      periodo,
      fecha_inicio,
      fecha_fin,
    );
    res.json({ ok: true, periodo, fecha_inicio, fecha_fin, reporte });
  } catch (error) {
    console.error("Error al generar reporte de ingresos:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Servicios más solicitados */
export const getServiciosTop = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite = 5 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 5;
    const servicios = await citaModel.getServiciosMasSolicitados(
      fecha_inicio,
      fecha_fin,
      limiteNum,
    );
    res.json({ ok: true, servicios });
  } catch (error) {
    console.error("Error al obtener servicios top:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Clientes más frecuentes */
export const getClientesTop = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite = 10 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 10;
    const clientes = await citaModel.getClientesMasFrecuentes(
      fecha_inicio,
      fecha_fin,
      limiteNum,
    );
    res.json({ ok: true, clientes });
  } catch (error) {
    console.error("Error al obtener clientes top:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Tasa de cancelación */
export const getTasaCancelacion = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const reporte = await citaModel.getTasaCancelacionPorBarbero(
      fecha_inicio,
      fecha_fin,
    );
    res.json({ ok: true, reporte });
  } catch (error) {
    console.error("Error al obtener tasa de cancelación:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

/** Editar cita completa (admin) */
export const editarCitaAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora, barbero_id, servicio_id, notas, estado } = req.body;
    const pool = getPool();

    const [citaExistente] = await pool.execute(
      `SELECT c.*, u.nombre as cliente_nombre, u.email as cliente_email 
       FROM citas c LEFT JOIN usuarios u ON c.cliente_id = u.id WHERE c.id = ?`,
      [id],
    );
    if (!citaExistente[0]) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    const citaOriginal = citaExistente[0];

    // FIX: validar fecha Y hora cuando se cambian
    if (fecha || hora) {
      const fechaEfectiva = fecha || citaOriginal.fecha;
      const horaEfectiva = hora || citaOriginal.hora;
      const errorFechaHora = validarFechaHoraFutura(
        fechaEfectiva,
        horaEfectiva,
      );
      if (errorFechaHora) {
        return res.status(400).json(errorFechaHora);
      }
    }

    if (
      (barbero_id && barbero_id !== citaOriginal.barbero_id) ||
      (fecha && fecha !== citaOriginal.fecha) ||
      (hora && hora !== citaOriginal.hora)
    ) {
      const [duplicado] = await pool.execute(
        "SELECT id FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ? AND id != ? AND estado NOT IN ('cancelada')",
        [
          barbero_id || citaOriginal.barbero_id,
          fecha || citaOriginal.fecha,
          hora || citaOriginal.hora,
          id,
        ],
      );
      if (duplicado.length > 0) {
        return res
          .status(409)
          .json({
            ok: false,
            message: "El barbero ya tiene una cita en ese horario",
          });
      }
    }

    let updates = [];
    let params = [];

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
      params.push(notas || null);
    }
    if (estado !== undefined && estado !== citaOriginal.estado) {
      updates.push("estado = ?");
      params.push(estado);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "No hay campos para actualizar" });
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await pool.execute(
      `UPDATE citas SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const cambiosImportantes =
      fecha !== undefined ||
      hora !== undefined ||
      barbero_id !== undefined ||
      estado !== undefined;

    if (cambiosImportantes && citaOriginal.cliente_id) {
      let mensaje = "";
      if (fecha || hora) {
        const nuevaFecha = fecha || citaOriginal.fecha;
        const nuevaHora = hora || citaOriginal.hora;
        mensaje = `Tu cita ha sido modificada. Nueva fecha: ${nuevaFecha} a las ${String(nuevaHora).substring(0, 5)}`;
      } else if (barbero_id) {
        const [barberoNuevo] = await pool.execute(
          "SELECT nombre FROM usuarios WHERE id = ?",
          [barbero_id],
        );
        mensaje = `Tu cita ha sido modificada. Nuevo barbero: ${barberoNuevo[0]?.nombre || "asignado"}`;
      } else if (estado) {
        mensaje = `El estado de tu cita ha cambiado a: ${estado}`;
      }

      if (mensaje) {
        await crearNotificacion(
          citaOriginal.cliente_id,
          "cita_editada_admin",
          "Tu cita fue modificada",
          mensaje,
          { citaId: id, cambios: { fecha, hora, barbero_id, estado } },
        );
      }
    }

    if (barbero_id !== undefined && barbero_id !== citaOriginal.barbero_id) {
      if (citaOriginal.barbero_id) {
        await crearNotificacion(
          citaOriginal.barbero_id,
          "cita_editada_admin",
          "Cita reasignada",
          `La cita #${id} ya no está asignada a ti`,
          { citaId: id },
        );
      }
      if (barbero_id) {
        await crearNotificacion(
          barbero_id,
          "cita_editada_admin",
          "Nueva cita asignada",
          `Se te ha asignado una cita para el ${fecha || citaOriginal.fecha} a las ${String(hora || citaOriginal.hora).substring(0, 5)}`,
          { citaId: id },
        );
      }
    }

    const [citaActualizada] = await pool.execute(
      `SELECT c.*, 
              u.nombre as cliente_nombre, u.email as cliente_email,
              b.nombre as barbero_nombre,
              s.nombre as servicio_nombre, s.duracion, s.precio
       FROM citas c
       LEFT JOIN usuarios u ON c.cliente_id = u.id
       LEFT JOIN usuarios b ON c.barbero_id = b.id
       LEFT JOIN servicios s ON c.servicio_id = s.id
       WHERE c.id = ?`,
      [id],
    );

    res.json({
      ok: true,
      message: "Cita actualizada exitosamente",
      cita: citaActualizada[0],
    });
  } catch (error) {
    console.error("Error al editar cita como admin:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
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
