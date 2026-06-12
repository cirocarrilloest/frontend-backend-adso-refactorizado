// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import chalk from "chalk";
import clear from "clear";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { cargarConfiguracion } from "./middlewares/configMiddleware.js";
import { startExpiredAppointmentsJob } from "./jobs/cleanExpiredAppointments.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Rutas
import authRoutes from "./routes/authRoutes.js";
import citaRoutes from "./routes/citaRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import contactoRoutes from "./routes/contactoRoutes.js";
import notificacionRoutes from "./routes/notificacionRoutes.js";

dotenv.config();

const app = express();
clear();

const startApp = async () => {
  try {
    await connectDB();
    console.log(chalk.green("✓ Base de datos conectada"));

    // Iniciar job de limpieza
    startExpiredAppointmentsJob();

    // Middlewares básicos
    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));

    // Middleware de configuración global
    app.use(cargarConfiguracion);

    // Rutas
    app.use("/api/auth", authRoutes);
    app.use("/api/citas", citaRoutes);
    app.use("/api/servicios", servicioRoutes);
    app.use("/api/usuarios", userRoutes);
    app.use("/api/config", configRoutes);
    app.use("/api/contacto", contactoRoutes);
    app.use("/api/notificaciones", notificacionRoutes);

    // Ruta no encontrada - 404
    app.use((req, res) => {
      res.status(404).json({
        ok: false,
        message: `Ruta no encontrada: ${req.method} ${req.url}`,
      });
    });

    // MIDDLEWARE DE ERROR GLOBAL (DEBE IR AL FINAL)
    app.use(errorHandler);

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(
        chalk.blue(`
╔════════════════════════════════════════════╗
║     🚀 Servidor iniciado correctamente     ║
╠════════════════════════════════════════════╣
║  Puerto: ${PORT}
║  URL: http://localhost:${PORT}
║  Entorno: ${process.env.NODE_ENV || "development"}
╚════════════════════════════════════════════╝
      `),
      );
    });
  } catch (error) {
    console.error(chalk.red("❌ Error al iniciar la app:"), error.message);
    process.exit(1);
  }
};

startApp();

export default app;
