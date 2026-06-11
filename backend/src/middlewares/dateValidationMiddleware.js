// backend/src/middlewares/dateValidationMiddleware.js
import citaModel from "../models/citaModel.js";
import { getPool } from "../config/db.js";

/**
 * Obtener días laborales desde configuración
 */
const getDiasLaborales = (req) => {
  const config = req.config || {};
  const diasLaborales = config.dias_laborales?.valor || [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  return diasLaborales;
};

/**
 * Valida que el día sea laborable
 */
export const validarDiaLaborable = (req, res, next) => {
  const { fecha } = req.body;

  if (!fecha) {
    return next();
  }

  const diasLaborales = getDiasLaborales(req);
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const fechaObj = new Date(fecha);
  const diaSemana = diasSemana[fechaObj.getDay()];

  if (!diasLaborales.includes(diaSemana)) {
    return res.status(400).json({
      ok: false,
      message: `El negocio no labora los ${diaSemana}. Días laborales: ${diasLaborales.join(", ")}`,
    });
  }

  next();
};

/**
 * Middleware para validar que la fecha/hora no sea anterior al momento actual.
 *
 */
export const validarFechaNoPasada = (
  fieldName = "fecha",
  isQuery = false,
  horaField = "hora",
) => {
  return (req, res, next) => {
    const fechaStr = isQuery ? req.query[fieldName] : req.body[fieldName];

    if (!fechaStr) {
      return next();
    }

    // Normalizar a YYYY-MM-DD (descarta zona horaria ISO si viene)
    let fechaNormalizada = fechaStr;
    if (fechaStr.includes("T")) {
      fechaNormalizada = fechaStr.split("T")[0];
    }

    // Fecha/hora actual sin zona horaria (local del servidor)
    const ahora = new Date();
    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;

    // 1) Rechazar fechas pasadas
    if (fechaNormalizada < hoyStr) {
      return res.status(400).json({
        ok: false,
        message: `No se puede seleccionar una fecha anterior a hoy (${hoyStr})`,
      });
    }

    // 2) Si es HOY, validar también que la hora no haya pasado
    if (fechaNormalizada === hoyStr) {
      const horaStr = isQuery ? req.query[horaField] : req.body[horaField];

      if (horaStr) {
        // Hora actual en formato HH:MM
        const horaActualStr = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

        // Normalizar hora del request a HH:MM (puede venir como "09:00:00")
        const horaNormalizada = String(horaStr).slice(0, 5);

        if (horaNormalizada <= horaActualStr) {
          return res.status(400).json({
            ok: false,
            message: `No se puede agendar una cita a una hora que ya pasó. Hora actual: ${horaActualStr}`,
          });
        }
      }
    }

    next();
  };
};

/**
 * Valida que la hora esté dentro del rango laboral del barbero.
 *
 */
export const validarHoraLaboral = async (req, res, next) => {
  const { barbero_id, fecha, hora } = req.body;

  if (!barbero_id || !fecha || !hora) {
    return next();
  }

  try {
    const pool = getPool();
    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];

    // Parsear fecha con hora fija para evitar problemas de zona horaria
    const fechaObj = new Date(fecha + "T12:00:00");
    const diaSemana = diasSemana[fechaObj.getDay()];

    // Horario configurado para este barbero en este día
    const [rows] = await pool.execute(
      `SELECT hora_inicio, hora_fin FROM horarios_barbero 
       WHERE barbero_id = ? AND dia_semana = ? AND activo = TRUE`,
      [barbero_id, diaSemana],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        ok: false,
        message: `El barbero no tiene horario configurado para los ${diaSemana}`,
      });
    }

    const horaStr = String(hora).slice(0, 5);
    const inicioBarbero = String(rows[0].hora_inicio).slice(0, 5);
    const finBarbero = String(rows[0].hora_fin).slice(0, 5);

    // FIX: validar SOLO contra el horario del barbero, no contra el horario general
    if (horaStr < inicioBarbero || horaStr >= finBarbero) {
      return res.status(400).json({
        ok: false,
        message: `La hora seleccionada (${horaStr}) está fuera del horario del barbero. Horario disponible: ${inicioBarbero} - ${finBarbero}`,
      });
    }

    next();
  } catch (error) {
    console.error("Error validando hora laboral:", error);
    res.status(500).json({ ok: false, message: "Error interno" });
  }
};

/**
 * Valida que una cancelación tenga suficiente antelación
 */
export const validarAntelacionCancelacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [citas] = await pool.execute(
      "SELECT fecha, hora FROM citas WHERE id = ?",
      [id],
    );

    if (citas.length === 0) {
      return res.status(404).json({ ok: false, message: "Cita no encontrada" });
    }

    const config = req.config || {};
    const permitirCancelacion =
      config.permitir_cancelacion?.valor === true ||
      config.permitir_cancelacion?.valor === "true";
    const horasMinimas = parseInt(config.horas_min_cancelacion?.valor || 2);

    if (!permitirCancelacion) {
      return res.status(400).json({
        ok: false,
        message:
          "El sistema no permite cancelar citas. Contacta al administrador.",
      });
    }

    const fechaCita = new Date(`${citas[0].fecha}T${citas[0].hora}`);
    const ahora = new Date();
    const diffHoras = (fechaCita - ahora) / (1000 * 60 * 60);

    if (diffHoras < horasMinimas) {
      return res.status(400).json({
        ok: false,
        message: `Para cancelar se requiere al menos ${horasMinimas} horas de antelación`,
      });
    }

    next();
  } catch (error) {
    console.error("Error validando antelación:", error);
    next();
  }
};
