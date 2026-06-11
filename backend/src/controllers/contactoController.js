// backend/src/controllers/contactoController.js

import { getPool } from "../config/db.js";
import { crearNotificacion } from "../models/notificacionModel.js";

/**
 * Enviar mensaje de contacto (público)
 */
export const enviarMensajeContacto = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, email y mensaje son requeridos",
      });
    }

    const pool = getPool();
    const query = `
      INSERT INTO contacto_mensajes (nombre, email, mensaje, fecha, leido)
      VALUES (?, ?, ?, NOW(), FALSE)
    `;

    const [result] = await pool.execute(query, [name, email, message]);

    // Notificar a todos los administradores
    const [admins] = await pool.execute(
      "SELECT id FROM usuarios WHERE rol = 'admin'",
    );

    for (const admin of admins) {
      await crearNotificacion(
        admin.id,
        "contacto",
        "Nuevo mensaje de contacto",
        `${name} (${email}) ha enviado un mensaje`,
        { mensajeId: result.insertId, nombre: name, email },
      );
    }

    res.json({
      ok: true,
      message: "Mensaje enviado exitosamente",
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
/**
 * Obtener mensajes de contacto (solo admin)
 */
export const getMensajesContacto = async (req, res) => {
  try {
    const { soloNoLeidos = "false", limite = 50 } = req.query;
    const pool = getPool();

    // VALIDACIÓN: Asegurar que limite sea un número válido
    let limiteNumero = parseInt(limite, 10);

    if (isNaN(limiteNumero) || limiteNumero <= 0) {
      limiteNumero = 50;
    }

    if (limiteNumero > 100) {
      limiteNumero = 100;
    }

    let query = `SELECT * FROM contacto_mensajes`;
    const params = [];

    if (soloNoLeidos === "true") {
      query += ` WHERE leido = FALSE`;
    }

    // SOLUCIÓN CRÍTICA: Usar template string para LIMIT
    query += ` ORDER BY fecha DESC LIMIT ${limiteNumero}`;

    const [rows] = await pool.execute(query, params);
    res.json({ ok: true, mensajes: rows });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

/**
 * Marcar mensaje como leído (solo admin)
 */
export const marcarMensajeLeido = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [result] = await pool.execute(
      "UPDATE contacto_mensajes SET leido = TRUE WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Mensaje no encontrado",
      });
    }
    res.json({ ok: true, message: "Mensaje marcado como leído" });
  } catch (error) {
    console.error("Error al marcar mensaje:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
