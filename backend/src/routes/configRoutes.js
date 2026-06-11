// backend/src/routes/configRoutes.js

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";

import {
  getConfiguracion,
  getConfigByKeyController,
  updateConfig,
  updateMultipleConfig,
} from "../controllers/configController.js";

const router = express.Router();

/**
 * RUTAS PÚBLICAS
 */

router.get("/", getConfiguracion);
router.get("/:key", getConfigByKeyController);

/**

 * RUTAS PRIVADAS (SOLO ADMIN)
 */

router.put("/:key", authMiddleware, esAdmin, updateConfig);

router.post("/batch", authMiddleware, esAdmin, updateMultipleConfig);

export default router;
