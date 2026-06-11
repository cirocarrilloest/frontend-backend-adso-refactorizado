// frontend/src/services/authService.js

import api from "./axiosConfig";

/** Iniciar sesión */
export const ingresar = async ({ email, pass }) => {
  try {
    const { data } = await api.post("/auth/ingreso", { email, pass });

    if (!data || !data.token || !data.user) {
      console.error("Respuesta del servidor:", data);
      throw new Error("Respuesta del servidor inválida");
    }

    return { token: data.token, user: data.user };
  } catch (error) {
    console.error("Error en ingresar:", error);
    throw error;
  }
};

/** Registrar usuario */
export const registrar = async ({ nombre, email, pass, telefono }) => {
  try {
    if (!nombre || !email || !pass) {
      throw new Error("Nombre, email y contraseña son requeridos");
    }

    if (pass.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const payload = {
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      pass: pass,
      telefono: telefono || null,
    };

    const { data } = await api.post("/auth/registro", payload);

    if (!data || !data.user) {
      console.error("Estructura de respuesta inválida:", data);
      throw new Error("Respuesta del servidor inválida");
    }

    return {
      success: true,
      message: data.message || "Registro exitoso",
      usuario: data.user,
    };
  } catch (error) {
    console.error("Error en registrar:", error);
    throw error;
  }
};

/** Cerrar sesión */
export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await api.post("/auth/logout");
    }
  } catch (error) {
    console.error("Error en logout:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
};
