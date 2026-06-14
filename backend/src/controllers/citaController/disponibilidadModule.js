// backend/src/controllers/citaController/disponibilidadModule.js
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

    // 1. Verificar si el horario específico está disponible
    const disponible = await citaRepository.existsDuplicate(
      barbero_id,
      fecha,
      hora,
    );

    // 2. ✅ OBTENER TODOS LOS HORARIOS OCUPADOS DEL DÍA
    let horariosOcupados = [];
    try {
      horariosOcupados = await citaRepository.getHorariosOcupados(
        barbero_id,
        fecha,
      );
      // Formatear las horas a HH:MM
      horariosOcupados = horariosOcupados.map((h) =>
        typeof h === "string" ? h.slice(0, 5) : String(h).slice(0, 5),
      );
    } catch (error) {
      console.error("Error obteniendo horarios ocupados:", error);
    }

    console.log(
      `[Disponibilidad] Barbero ${barbero_id}, Fecha ${fecha}, Hora ${hora}`,
    );
    console.log(`[Disponibilidad] Horarios ocupados:`, horariosOcupados);

    return ok(res, {
      disponible: !disponible,
      mensaje: disponible ? "Horario no disponible" : "Horario disponible",
      horarios_ocupados: horariosOcupados, // ✅ Esto es lo que faltaba
    });
  } catch (error) {
    console.error("Error en verificarDisponibilidad:", error);
    next(error);
  }
};
