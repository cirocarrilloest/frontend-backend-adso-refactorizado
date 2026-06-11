// src/routes/authRoutes.js

import express from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Públicas
router.post("/registro", authController.registrarUsuario);
router.post("/ingreso", authController.ingresarUsuario);

// Protegidas (requieren token)
router.post("/logout", authMiddleware, authController.logoutUsuario);
router.get("/perfil", authMiddleware, authController.getPerfilUsuario);
router.put("/perfil", authMiddleware, userController.updateMiPerfil);
router.delete("/cuenta", authMiddleware, userController.deleteMiCuenta);
router.post(
  "/cambiar-password",
  authMiddleware,
  authController.cambiarPassword,
);

// ELIMINADO: router.get("/barbero/:id", ...) → ahora vive en userRoutes

export default router;
