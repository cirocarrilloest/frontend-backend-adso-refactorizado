// backend/src/routes/contactoRoutes.js
import express from "express";
import {
  enviarMensajeContacto,
  getMensajesContacto,
  marcarMensajeLeido,
} from "../controllers/contactoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/** Enviar mensaje de contacto (público) */
router.post("/", enviarMensajeContacto);

/** Obtener mensajes (solo admin) */
router.get("/mensajes", authMiddleware, esAdmin, getMensajesContacto);

/** Marcar mensaje como leído (solo admin) */
router.patch("/mensajes/:id/leer", authMiddleware, esAdmin, marcarMensajeLeido);

export default router;
