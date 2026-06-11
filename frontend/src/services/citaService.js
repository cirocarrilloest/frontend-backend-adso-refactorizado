// frontend/src/services/citaService.js
import api from "./axiosConfig";

// CLIENTE

/** Agendar nueva cita */
export const agendarCita = async ({
  barbero_id,
  servicio_id,
  fecha,
  hora,
  notas,
}) => {
  const { data } = await api.post("/citas", {
    barbero_id,
    servicio_id,
    fecha,
    hora,
    notas,
  });
  return data;
};

/** Mis citas (todas) */
export const getMisCitas = async () => {
  const { data } = await api.get("/citas/mis-citas");
  return data;
};

/** Próximas citas */
export const getProximasCitas = async () => {
  const { data } = await api.get("/citas/proximas");
  return data;
};

/** Historial de citas */
export const getHistorialCitas = async (limite = 10) => {
  const { data } = await api.get("/citas/historial", { params: { limite } });
  return data;
};

/** Reagendar cita */
export const reagendarCita = async (id, { fecha, hora }) => {
  const { data } = await api.put(`/citas/${id}/reagendar`, { fecha, hora });
  return data;
};

/** Cancelar cita */
export const cancelarCita = async (id) => {
  const { data } = await api.delete(`/citas/${id}`);
  return data;
};

/** Obtener cita por ID */
export const getCitaById = async (id) => {
  const { data } = await api.get(`/citas/${id}`);
  return data;
};

// BARBERO / ADMIN

/** Agenda del día */
export const getAgendaDia = async (fecha = null, barbero_id = null) => {
  const params = {};
  if (fecha) params.fecha = fecha;
  if (barbero_id) params.barbero_id = barbero_id;
  const { data } = await api.get("/citas/agenda-dia", { params });
  return data;
};

/** Resumen de citas por estado */
export const getResumenCitas = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const params = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;
  const { data } = await api.get("/citas/resumen", { params });
  return data;
};

/** Agenda semanal */
export const getAgendaSemana = async (barbero_id, fecha_inicio = null) => {
  const params = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  const { data } = await api.get(`/citas/barbero/${barbero_id}/semana`, {
    params,
  });
  return data;
};

/** Horarios disponibles de un barbero */
export const getHorariosDisponibles = async (barbero_id, fecha) => {
  const { data } = await api.get(
    `/citas/barbero/${barbero_id}/horarios-disponibles`,
    {
      params: { fecha },
    },
  );
  return data;
};

/** Citas de un barbero */
export const getCitasBarbero = async (barbero_id, fecha = null) => {
  const params = {};
  if (fecha) params.fecha = fecha;
  const { data } = await api.get(`/citas/barbero/${barbero_id}`, { params });
  return data;
};

/** Confirmar cita */
export const confirmarCita = async (id) => {
  const { data } = await api.patch(`/citas/${id}/confirmar`);
  return data;
};

/** Finalizar cita */
export const finalizarCita = async (id) => {
  const { data } = await api.patch(`/citas/${id}/finalizar`);
  return data;
};

/** Actualizar estado de cita */
export const actualizarEstadoCita = async (id, estado) => {
  const { data } = await api.put(`/citas/${id}/estado`, { estado });
  return data;
};

/** Verificar disponibilidad */
export const verificarDisponibilidad = async (barbero_id, fecha, hora) => {
  const { data } = await api.get("/citas/disponibilidad", {
    params: { barbero_id, fecha, hora },
  });
  return data;
};

// ADMIN

/** Crear cita como administrador (para cualquier cliente) */
export const crearCitaAdmin = async ({
  cliente_id,
  barbero_id,
  servicio_id,
  fecha,
  hora,
  notas,
}) => {
  const { data } = await api.post("/citas/admin/crear", {
    cliente_id,
    barbero_id,
    servicio_id,
    fecha,
    hora,
    notas,
  });
  return data;
};

/**
 * Todas las citas con filtros y paginación
 */
export const getAllCitas = async ({
  estado,
  fecha_desde,
  fecha_hasta,
  page = 1,
  limit = 15,
} = {}) => {
  const params = new URLSearchParams();

  if (estado && estado !== "") params.append("estado", estado);
  if (fecha_desde) params.append("fecha_desde", fecha_desde);
  if (fecha_hasta) params.append("fecha_hasta", fecha_hasta);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  const queryString = params.toString();
  const url = `/citas/todas${queryString ? `?${queryString}` : ""}`;

  const { data } = await api.get(url);
  return data;
};

/** Dashboard estadísticas */
export const getDashboard = async () => {
  const { data } = await api.get("/citas/dashboard");
  return data;
};

/** Distribución horaria */
export const getDistribucionHoraria = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const params = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;
  const { data } = await api.get("/citas/distribucion-horaria", { params });
  return data;
};

/** Reporte de ingresos */
export const getReporteIngresos = async (periodo, fecha_inicio, fecha_fin) => {
  const { data } = await api.get("/citas/reporte/ingresos", {
    params: { periodo, fecha_inicio, fecha_fin },
  });
  return data;
};

/** Servicios más solicitados */
export const getServiciosTop = async (
  limite = 5,
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const params = { limite };
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;
  const { data } = await api.get("/citas/reporte/servicios-top", { params });
  return data;
};

/** Clientes más frecuentes */
export const getClientesTop = async (
  limite = 10,
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const params = { limite };
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;
  const { data } = await api.get("/citas/reporte/clientes-top", { params });
  return data;
};

/** Tasa de cancelación */
export const getTasaCancelacion = async (
  fecha_inicio = null,
  fecha_fin = null,
) => {
  const params = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;
  const { data } = await api.get("/citas/reporte/tasa-cancelacion", { params });
  return data;
};

/**
 * Editar cita completa como administrador
 */
export const editarCitaAdmin = async (id, datos) => {
  const { data } = await api.put(`/citas/admin/${id}`, {
    fecha: datos.fecha,
    hora: datos.hora,
    barbero_id: datos.barbero_id,
    servicio_id: datos.servicio_id,
    notas: datos.notas,
    estado: datos.estado,
  });
  return data;
};
