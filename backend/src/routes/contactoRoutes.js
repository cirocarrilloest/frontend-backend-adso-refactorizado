// backend/src/routes/contactoRoutes.js
import express from "express";
import {
  enviarMensajeContacto,
  getMensajesContacto,
  getMensajeById,
  marcarMensajeLeido,
  marcarMensajeRespondido,
  eliminarMensaje,
  eliminarMensajesMultiples,
  getEstadisticasContacto,
} from "../controllers/contactoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/** Enviar mensaje de contacto (público) */
router.post("/", enviarMensajeContacto);

/** ============ RUTAS PROTEGIDAS (SOLO ADMIN) ============ */
router.use(authMiddleware);
router.use(esAdmin);

/** Obtener estadísticas */
router.get("/estadisticas", getEstadisticasContacto);

/** Obtener todos los mensajes (con paginación y filtros) */
router.get("/mensajes", getMensajesContacto);

/** Obtener mensaje por ID */
router.get("/mensajes/:id", getMensajeById);

/** Marcar mensaje como leído */
router.patch("/mensajes/:id/leer", marcarMensajeLeido);

/** Marcar mensaje como respondido */
router.patch("/mensajes/:id/responder", marcarMensajeRespondido);

/** Eliminar mensaje */
router.delete("/mensajes/:id", eliminarMensaje);

/** Eliminar múltiples mensajes */
router.post("/mensajes/eliminar-multiples", eliminarMensajesMultiples);

export default router;
