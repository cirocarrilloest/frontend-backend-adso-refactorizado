// backend/src/controllers/configController.js
import {
  getAllConfig,
  getConfigByKey,
  setConfig,
  setManyConfig,
} from "../models/configModel.js";

// Obtener toda la configuración
export const getConfiguracion = async (req, res) => {
  try {
    const config = await getAllConfig();
    res.json({
      ok: true,
      configuracion: config,
    });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener una configuración específica
export const getConfigByKeyController = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await getConfigByKey(key);

    if (!config) {
      return res.status(404).json({
        ok: false,
        message: "Clave de configuración no encontrada",
      });
    }

    res.json({
      ok: true,
      configuracion: config,
    });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Actualizar una configuración
export const updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { valor } = req.body;

    if (valor === undefined) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere el campo 'valor'",
      });
    }

    const configActualizada = await setConfig(key, valor);

    if (!configActualizada) {
      return res.status(404).json({
        ok: false,
        message: "Clave de configuración no encontrada",
      });
    }

    res.json({
      ok: true,
      message: "Configuración actualizada exitosamente",
      configuracion: configActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Actualizar múltiples configuraciones
export const updateMultipleConfig = async (req, res) => {
  try {
    const { configuraciones } = req.body;

    if (!configuraciones || typeof configuraciones !== "object") {
      return res.status(400).json({
        ok: false,
        message:
          "Se requiere un objeto 'configuraciones' con las claves y valores a actualizar",
      });
    }

    const configActualizada = await setManyConfig(configuraciones);

    res.json({
      ok: true,
      message: "Configuraciones actualizadas exitosamente",
      configuracion: configActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar configuraciones:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
