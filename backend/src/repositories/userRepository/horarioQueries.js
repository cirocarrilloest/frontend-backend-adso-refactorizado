// backend/src/repositories/userRepository/horarioQueries.js
import { getPool } from "../../config/db.js";
import { validarHorarioBarbero, DIAS_SEMANA_ORDEN } from "./helpers.js";

/**
 * OBTENER HORARIOS DE UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @returns {Promise<Array>} Lista de horarios ordenados por día
 *
 * Frontend:
 * - Panel Barbero: Configuración de horarios
 * - Cliente: Ver disponibilidad del barbero
 * - Endpoint: GET /api/usuarios/barbero/:id/horarios
 *
 * Backend relacionado: userController.getHorarioBarbero
 *
 * Ejemplo de respuesta:
 * [
 *   { id: 1, barbero_id: 1, dia_semana: "lunes", hora_inicio: "09:00", hora_fin: "18:00" },
 *   { id: 2, barbero_id: 1, dia_semana: "martes", hora_inicio: "09:00", hora_fin: "18:00" }
 * ]
 */
export const getHorarioBarbero = async (barberoId) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM horarios_barbero 
     WHERE barbero_id = ? AND activo = TRUE 
     ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')`,
    [barberoId],
  );
  return rows;
};

/**
 * CONFIGURAR HORARIO DE BARBERO (crear o actualizar)
 * @param {number} barberoId - ID del barbero
 * @param {Object} horario - Datos del horario
 * @param {string} horario.dia_semana - Día de la semana
 * @param {string} horario.hora_inicio - Hora de inicio (HH:MM:SS)
 * @param {string} horario.hora_fin - Hora de fin (HH:MM:SS)
 * @returns {Promise<Object>} Horario configurado
 * @throws {Error} Si la hora es inválida
 *
 * Frontend:
 * - Panel Barbero: Formulario de configuración de horarios
 * - Admin: Configurar horarios de barberos
 * - Endpoint: POST /api/usuarios/barbero/:id/horarios
 *
 * Backend relacionado: userController.setHorarioBarbero
 */
export const setHorarioBarbero = async (
  barberoId,
  { dia_semana, hora_inicio, hora_fin },
) => {
  const pool = getPool();

  // Validar horario
  validarHorarioBarbero(hora_inicio, hora_fin);

  // Verificar si ya existe horario para ese día
  const [existing] = await pool.execute(
    `SELECT id FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ?`,
    [barberoId, dia_semana],
  );

  if (existing.length > 0) {
    // Actualizar horario existente
    await pool.execute(
      `UPDATE horarios_barbero 
       SET hora_inicio = ?, hora_fin = ?, activo = TRUE, updated_at = NOW()
       WHERE barbero_id = ? AND dia_semana = ?`,
      [hora_inicio, hora_fin, barberoId, dia_semana],
    );
  } else {
    // Crear nuevo horario
    await pool.execute(
      `INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin, activo) 
       VALUES (?, ?, ?, ?, TRUE)`,
      [barberoId, dia_semana, hora_inicio, hora_fin],
    );
  }

  return { barbero_id: barberoId, dia_semana, hora_inicio, hora_fin };
};

/**
 * ELIMINAR HORARIO DE BARBERO
 * @param {number} barberoId - ID del barbero
 * @param {string} diaSemana - Día de la semana
 * @returns {Promise<boolean>} True si se eliminó
 *
 * Frontend:
 * - Panel Barbero: Botón eliminar horario
 * - Admin: Eliminar horario de barbero
 * - Endpoint: DELETE /api/usuarios/barbero/:id/horarios/:dia
 *
 * Backend relacionado: userController.deleteHorarioBarbero
 */
export const deleteHorarioBarbero = async (barberoId, diaSemana) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `DELETE FROM horarios_barbero WHERE barbero_id = ? AND dia_semana = ?`,
    [barberoId, diaSemana],
  );
  return result.affectedRows > 0;
};
