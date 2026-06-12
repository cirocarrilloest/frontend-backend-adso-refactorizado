// backend/src/routes/authRoutes.js
import express from "express";
import * as authController from "../controllers/authController.js";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/registro", authController.registrarUsuario);
router.post("/ingreso", authController.ingresarUsuario);

// Rutas protegidas (requieren token)
router.post("/logout", authMiddleware, authController.logoutUsuario);
router.get("/perfil", authMiddleware, authController.getPerfilUsuario);
router.put("/perfil", authMiddleware, userController.updateMiPerfil);
router.delete("/cuenta", authMiddleware, userController.deleteMiCuenta);
router.post(
  "/cambiar-password",
  authMiddleware,
  authController.cambiarPassword,
);

export default router;
