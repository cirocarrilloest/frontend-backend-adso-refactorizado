// backend/src/services/barberoCitaService/resumenService.js
import { getPool } from "../../config/db.js";

/**
 * OBTENER RESUMEN DE CITAS POR ESTADO PARA UN BARBERO
 * @param {number} barberoId - ID del barbero
 * @param {string|null} fechaInicio - Fecha de inicio (opcional)
 * @param {string|null} fechaFin - Fecha de fin (opcional)
 * @returns {Promise<Object>} Resumen con totales por estado e ingresos
 *
 * Frontend: Panel barbero - Tarjetas de estadísticas
 * - Componente: ResumenCitasCard
 * - Endpoint: GET /api/citas/resumen?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
 *
 * Backend relacionado:
 * - Pool connection (consulta directa)
 * - Tablas: citas, servicios
 */
export const getResumenCitas = async (
  barberoId,
  fechaInicio = null,
  fechaFin = null,
) => {
  const pool = getPool();

  let query = `
    SELECT 
      c.estado, 
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN c.estado = 'completada' THEN s.precio ELSE 0 END), 0) as ingreso
    FROM citas c
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.barbero_id = ?
  `;
  const params = [barberoId];

  if (fechaInicio && fechaFin) {
    query += " AND c.fecha BETWEEN ? AND ?";
    params.push(fechaInicio, fechaFin);
  }

  query += " GROUP BY c.estado";

  const [rows] = await pool.execute(query, params);

  // Formatear resultado como objeto
  const resumen = {
    pendiente: 0,
    confirmada: 0,
    completada: 0,
    cancelada: 0,
    total: 0,
    ingresos: 0,
  };

  rows.forEach((row) => {
    switch (row.estado) {
      case "pendiente":
        resumen.pendiente = row.total;
        break;
      case "confirmada":
        resumen.confirmada = row.total;
        break;
      case "completada":
        resumen.completada = row.total;
        resumen.ingresos = row.ingreso;
        break;
      case "cancelada":
        resumen.cancelada = row.total;
        break;
    }
    resumen.total += row.total;
  });

  return resumen;
};
