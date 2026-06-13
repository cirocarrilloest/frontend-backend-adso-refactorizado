// backend/src/services/citaService/adminService.js
import userRepository from "../../repositories/userRepository.js";
import servicioRepository from "../../repositories/servicioRepository.js";
import * as citaModel from "../../models/citaModel.js";
import { crearNotificacion } from "../../models/notificacionModel.js";
import {
  verificarBarbero,
  verificarServicio,
  validarFechaCita,
  verificarDisponibilidadHorario,
} from "./helpers.js";
import { TIPOS_NOTIFICACION } from "./constants.js";

/**
 * CREAR CITA COMO ADMINISTRADOR
 * @param {Object} params
 * @param {number} params.clienteId - ID del cliente
 * @param {number} params.barberoId - ID del barbero
 * @param {number} params.servicioId - ID del servicio
 * @param {string} params.fecha - Fecha (YYYY-MM-DD)
 * @param {string} params.hora - Hora (HH:MM:SS)
 * @param {string} params.notas - Notas opcionales
 * @returns {Promise<{cita: Object, error: string, notFound: string}>}
 *
 * Frontend: Panel Admin - Formulario crear cita
 * - Componente: CrearCitaAdminForm
 * - Endpoint: POST /api/citas/admin/crear
 *
 * Backend relacionado:
 * - userRepository.findById
 * - servicioRepository.findById
 * - citaModel.createCita
 * - crearNotificacion (doble: cliente y barbero)
 */
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
  const { barbero, error: errorBarbero } = await verificarBarbero(barberoId);
  if (errorBarbero) return { notFound: errorBarbero };

  // Validar servicio
  const { servicio, error: errorServicio } =
    await verificarServicio(servicioId);
  if (errorServicio) return { notFound: errorServicio };

  // Validar fecha
  const { error: errorFecha } = await validarFechaCita(fecha, hora);
  if (errorFecha) return { error: errorFecha };

  // Verificar disponibilidad
  const disponible = await verificarDisponibilidadHorario(
    barberoId,
    fecha,
    hora,
  );
  if (!disponible) {
    return { error: "El horario seleccionado no está disponible" };
  }

  // Crear cita (confirmada directamente)
  const citaCreada = await citaModel.createCita({
    cliente_id: clienteId,
    barbero_id: barberoId,
    servicio_id: servicioId,
    fecha,
    hora,
    notas,
    estado: "confirmada",
  });

  // Notificar al cliente
  await crearNotificacion(
    clienteId,
    TIPOS_NOTIFICACION.CITA_NUEVA,
    "Cita agendada por administrador",
    `El administrador agendó tu cita de ${servicio.nombre} el ${fecha} a las ${hora} con ${barbero.nombre}`,
    { citaId: citaCreada.id },
  );

  // Notificar al barbero
  await crearNotificacion(
    barberoId,
    TIPOS_NOTIFICACION.CITA_NUEVA,
    "Nueva cita asignada",
    `Se te ha asignado una nueva cita de ${cliente.nombre} el ${fecha} a las ${hora} - ${servicio.nombre}`,
    { citaId: citaCreada.id },
  );

  return { cita: citaCreada };
};

/**
 * EDITAR CITA COMO ADMINISTRADOR
 * @param {Object} params
 * @param {number} params.citaId - ID de la cita
 * @param {Object} params.campos - Campos a actualizar
 * @returns {Promise<{cita: Object, error: string, notFound: string, conflict: string}>}
 *
 * Frontend: Panel Admin - Modal editar cita
 * - Componente: EditarCitaAdminModal
 * - Endpoint: PUT /api/citas/admin/:id
 *
 * Backend relacionado:
 * - citaModel.getCitaById
 * - citaModel.verificarDuplicado
 * - citaModel.updateCitaAdmin
 * - userRepository.findById
 * - crearNotificacion
 */
export const editarCitaAdmin = async ({ citaId, campos }) => {
  const citaExistente = await citaModel.getCitaById(citaId);
  if (!citaExistente) return { notFound: "Cita no encontrada" };

  // Validar fecha si se está cambiando
  if (campos.fecha || campos.hora) {
    const { error: errorFecha } = await validarFechaCita(
      campos.fecha || citaExistente.fecha,
      campos.hora || citaExistente.hora,
    );
    if (errorFecha) return { error: errorFecha };
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
    if (duplicado) {
      return { conflict: "El barbero ya tiene una cita en ese horario" };
    }
  }

  // Actualizar cita
  const citaActualizada = await citaModel.updateCitaAdmin(citaId, campos);

  // Notificar cambios de fecha/hora al cliente
  if ((campos.fecha || campos.hora) && citaExistente.cliente_id) {
    await crearNotificacion(
      citaExistente.cliente_id,
      TIPOS_NOTIFICACION.CITA_EDITADA_ADMIN,
      "Tu cita fue modificada",
      `Tu cita ha sido modificada. Nueva fecha: ${campos.fecha || citaExistente.fecha} a las ${String(campos.hora || citaExistente.hora).substring(0, 5)}`,
      { citaId, cambios: campos },
    );
  }

  // Notificar cambio de barbero
  if (
    campos.barbero_id !== undefined &&
    campos.barbero_id !== citaExistente.barbero_id
  ) {
    // Notificar al barbero anterior
    if (citaExistente.barbero_id) {
      await crearNotificacion(
        citaExistente.barbero_id,
        TIPOS_NOTIFICACION.CITA_EDITADA_ADMIN,
        "Cita reasignada",
        `La cita #${citaId} ya no está asignada a ti`,
        { citaId },
      );
    }

    // Notificar al nuevo barbero
    if (campos.barbero_id) {
      const nuevoBarbero = await userRepository.findById(campos.barbero_id);
      if (nuevoBarbero) {
        await crearNotificacion(
          campos.barbero_id,
          TIPOS_NOTIFICACION.CITA_EDITADA_ADMIN,
          "Nueva cita asignada",
          `Se te ha asignado una cita para el ${campos.fecha || citaExistente.fecha} a las ${String(campos.hora || citaExistente.hora).substring(0, 5)}`,
          { citaId },
        );
      }
    }
  }

  return { cita: citaActualizada };
};
