// src/routes/citaRoutes.js
import express from "express";
import * as citaController from "../controllers/citaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin, esBarberoOAdmin } from "../middlewares/roleMiddleware.js";
import { validarCitaMiddleware } from "../middlewares/validationMiddleware.js";
import {
  validarFechaNoPasada,
  validarHoraLaboral,
} from "../middlewares/dateValidationMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ============ RUTAS CLIENTE ============
router.get("/mis-citas", citaController.getMisCitas);
router.get("/proximas", citaController.getProximasCitas);
router.get("/historial", citaController.getHistorialCitas);
router.post(
  "/",
  validarCitaMiddleware,
  validarFechaNoPasada(),
  validarHoraLaboral,
  citaController.agendarCita,
);
router.put(
  "/:id/reagendar",
  validarFechaNoPasada(),
  citaController.reagendarCita,
);
router.delete("/:id", citaController.cancelarCita);

// ============ RUTAS BARBERO/ADMIN ============
router.get("/agenda-dia", esBarberoOAdmin, citaController.getAgendaDia);
router.get(
  "/barbero/:id/semana",
  esBarberoOAdmin,
  citaController.getAgendaSemana,
);
router.get(
  "/barbero/:barbero_id",
  esBarberoOAdmin,
  citaController.getCitasBarbero,
);
router.get(
  "/barbero/:id/horarios-disponibles",
  citaController.getHorariosDisponibles,
);
router.get("/resumen", esBarberoOAdmin, citaController.getResumenCitas);
router.put("/:id/estado", esBarberoOAdmin, citaController.actualizarEstadoCita);
router.patch("/:id/confirmar", esBarberoOAdmin, citaController.confirmarCita);
router.patch("/:id/finalizar", esBarberoOAdmin, citaController.finalizarCita);

// ============ RUTAS ADMIN ============
router.post("/admin/crear", esAdmin, citaController.crearCitaAdmin);
router.put("/admin/:id", esAdmin, citaController.editarCitaAdmin);
router.get("/todas", esAdmin, citaController.getAllCitas);
router.get("/dashboard", esAdmin, citaController.getDashboard);
router.get(
  "/distribucion-horaria",
  esAdmin,
  citaController.getDistribucionHoraria,
);
router.get("/reporte/ingresos", esAdmin, citaController.getReporteIngresos);
router.get("/reporte/servicios-top", esAdmin, citaController.getServiciosTop);
router.get("/reporte/clientes-top", esAdmin, citaController.getClientesTop);
router.get(
  "/reporte/tasa-cancelacion",
  esAdmin,
  citaController.getTasaCancelacion,
);
router.get(
  "/reporte/tasa-cancelacion-barbero",
  esAdmin,
  citaController.getTasaCancelacionPorBarbero,
);

// ============ RUTA PÚBLICA DE VERIFICACIÓN ============
router.get("/disponibilidad", citaController.verificarDisponibilidad);

// ============ OBTENER POR ID (SIEMPRE AL FINAL) ============
router.get("/:id", citaController.getCitaById);

export default router;
