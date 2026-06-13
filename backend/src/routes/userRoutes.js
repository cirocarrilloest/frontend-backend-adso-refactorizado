// src/routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";
import { validarRegistroMiddleware } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// ============ RUTAS PÚBLICAS ============
router.post(
  "/registro",
  validarRegistroMiddleware,
  authController.registrarUsuario,
);
router.post("/ingreso", authController.ingresarUsuario);

// ============ RUTAS PROTEGIDAS ============
router.use(authMiddleware);

// Perfil de usuario
router.get("/perfil", authController.getPerfilUsuario);
router.put("/perfil", userController.updateMiPerfil);
router.put("/password", authController.cambiarPassword);

// Rutas de barberos (GET - consulta)
router.get("/barberos/listar", userController.getBarberos);
router.get("/barberos", userController.getBarberos);
router.get("/barberos/:id/perfil", userController.getBarberoPerfil);
router.get("/barberos/:id/horario", userController.getHorarioBarbero);
router.get("/barberos/:id/horarios", userController.getHorarioBarbero);

// Rutas de barberos (POST - creación/actualización de horarios)
router.post("/barberos/:id/horario", esAdmin, userController.setHorarioBarbero);
router.post(
  "/barberos/:id/horarios",
  esAdmin,
  userController.setHorarioBarbero,
);

// ============ RUTAS ADMIN ============
// Ruta de conteos (DEBE IR ANTES de /:id para que no entre en conflicto)
router.get("/counts", esAdmin, userController.getUserCounts);

// GET - Listar usuarios
router.get("/", esAdmin, userController.getUsuarios);
router.get("/:id", esAdmin, userController.getUsuarioById);

// POST - Crear usuario
router.post("/", esAdmin, userController.createUsuario);

// PUT - Actualizar usuario
router.put("/:id", esAdmin, userController.updateUsuario);

// PATCH - Cambiar rol
router.patch("/:id/rol", esAdmin, userController.asignarRol);

// POST - Cambiar contraseña de un usuario (AGREGAR ESTA)
router.post(
  "/:id/cambiar-password",
  esAdmin,
  userController.cambiarPasswordAdmin,
);

// DELETE - Eliminar usuario
router.delete("/:id", esAdmin, userController.deleteUsuario);

// Rutas de horarios de barbero (DELETE - eliminación)
router.delete(
  "/barberos/:id/horarios/:dia",
  esAdmin,
  userController.deleteHorarioBarbero,
);
router.delete(
  "/barberos/:id/horario/:dia",
  esAdmin,
  userController.deleteHorarioBarbero,
);

export default router;
