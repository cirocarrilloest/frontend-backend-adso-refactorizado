// backend/src/routes/notificacionRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  contarNoLeidas,
} from "../controllers/notificacionController.js";

const router = express.Router();
router.use(authMiddleware);

/** Obtener notificaciones del usuario */
router.get("/", getMisNotificaciones);

/** Contar notificaciones no leídas */
router.get("/contar-no-leidas", contarNoLeidas);

/** Marcar una notificación como leída */
router.patch("/:id/leer", marcarNotificacionLeida);

/** Marcar todas como leídas */
router.patch("/leer-todas", marcarTodasLeidas);

export default router;
