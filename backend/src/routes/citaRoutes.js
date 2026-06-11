// backend/src/routes/citaRoutes.js
import express from "express";
import * as citaController from "../controllers/citaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin, esBarberoOAdmin } from "../middlewares/roleMiddleware.js";
import {
  validarCita,
  validarCitaAdmin,
} from "../middlewares/validationMiddleware.js";
import {
  validarFechaNoPasada,
  validarHoraLaboral,
} from "../middlewares/dateValidationMiddleware.js";

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// ========== RUTAS FIJAS (deben ir antes de las que tienen parámetros) ==========

/** Obtener mis citas (cliente) */
router.get("/mis-citas", citaController.getMisCitas);

/** Obtener próximas citas (cliente) */
router.get("/proximas", citaController.getProximasCitas);

/** Obtener historial de citas (cliente) */
router.get("/historial", citaController.getHistorialCitas);

/** Verificar disponibilidad de horario */
router.get("/disponibilidad", citaController.verificarDisponibilidad);

/** Agenda del día (barbero/admin) */
router.get("/agenda-dia", esBarberoOAdmin, citaController.getAgendaDia);

/** Resumen de citas (barbero) */
router.get("/resumen", esBarberoOAdmin, citaController.getResumenCitas);

/** Todas las citas (admin) */
router.get("/todas", esAdmin, citaController.getAllCitas);

/** Dashboard estadísticas (admin) */
router.get("/dashboard", esAdmin, citaController.getDashboard);

/** Distribución horaria (admin) */
router.get(
  "/distribucion-horaria",
  esAdmin,
  citaController.getDistribucionHoraria,
);

/** Reporte de ingresos (admin) */
router.get("/reporte/ingresos", esAdmin, citaController.getReporteIngresos);

/** Servicios más solicitados (admin) */
router.get("/reporte/servicios-top", esAdmin, citaController.getServiciosTop);

/** Clientes más frecuentes (admin) */
router.get("/reporte/clientes-top", esAdmin, citaController.getClientesTop);

/** Tasa de cancelación (admin) */
router.get(
  "/reporte/tasa-cancelacion",
  esAdmin,
  citaController.getTasaCancelacion,
);

// ========== RUTAS CON PARÁMETROS ESPECÍFICOS ==========

/** Horarios disponibles de un barbero */
router.get(
  "/barbero/:id/horarios-disponibles",
  citaController.getHorariosDisponibles,
);

/** Agenda semanal de un barbero */
router.get(
  "/barbero/:id/semana",
  esBarberoOAdmin,
  citaController.getAgendaSemana,
);

/** Citas de un barbero específico */
router.get(
  "/barbero/:barbero_id",
  esBarberoOAdmin,
  citaController.getCitasBarbero,
);

// RUTAS ADMIN

/**  Crear cita como admin (para cualquier cliente) */
router.post(
  "/admin/crear",
  esAdmin,
  validarCitaAdmin,
  validarFechaNoPasada("fecha", false),
  validarHoraLaboral,
  citaController.crearCitaAdmin,
);

/** Editar cita (admin) */
router.put("/admin/:id", esAdmin, citaController.editarCitaAdmin);

// RUTAS CON ID

/** Crear nueva cita (cliente normal - para sí mismo) */
router.post(
  "/",
  validarCita,
  validarFechaNoPasada("fecha", false),
  validarHoraLaboral,
  citaController.agendarCita,
);

/** Actualizar estado de cita */
router.put("/:id/estado", esBarberoOAdmin, citaController.actualizarEstadoCita);

/** Reagendar cita */
router.put(
  "/:id/reagendar",
  validarFechaNoPasada("fecha", false),
  citaController.reagendarCita,
);

/** Confirmar cita */
router.patch("/:id/confirmar", esBarberoOAdmin, citaController.confirmarCita);

/** Finalizar cita */
router.patch("/:id/finalizar", esBarberoOAdmin, citaController.finalizarCita);

/** Cancelar cita */
router.delete("/:id", citaController.cancelarCita);

/** Obtener cita por ID (SIEMPRE LA ÚLTIMA) */
router.get("/:id", citaController.getCitaById);

export default router;
