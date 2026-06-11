// src/routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";
import { validarHorario } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Rutas de barberos (cualquier usuario autenticado puede consultar)
// Las rutas con segmentos fijos ANTES de las de parámetro :id
router.get("/barberos/listar", authMiddleware, userController.getBarberos);
router.get(
  "/barberos/:id/perfil",
  authMiddleware,
  authController.getPerfilBarbero,
);
router.get(
  "/barberos/:id/horario",
  authMiddleware,
  userController.getHorarioBarbero,
);

// Configurar horario — solo admin
router.post(
  "/barberos/:id/horario",
  authMiddleware,
  esAdmin,
  validarHorario,
  userController.setHorarioBarbero,
);

// Eliminar día del horario — solo admin
router.delete(
  "/barberos/:id/horario/:dia",
  authMiddleware,
  esAdmin,
  userController.deleteHorarioBarbero,
);

// Rutas admin (CRUD usuarios)
router.use(authMiddleware, esAdmin);

router.get("/", userController.getUsuarios);
router.get("/:id", userController.getUsuarioById);
router.post("/", userController.createUsuario);
router.put("/:id", userController.updateUsuario);
router.post("/:id/cambiar-password", userController.cambiarPasswordAdmin);
router.delete("/:id", userController.deleteUsuario);
router.patch("/:id/rol", userController.asignarRol);
router.get("/:id/citas", userController.getCitasDeUsuario);

export default router;
