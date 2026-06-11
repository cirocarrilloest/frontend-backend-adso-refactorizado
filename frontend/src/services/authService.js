// frontend/src/services/authService.js
import api from "./axiosConfig";

/** Iniciar sesión */
export const ingresar = async ({ email, pass }) => {
  try {
    const { data } = await api.post("/auth/ingreso", { email, pass });

    // Validar que la respuesta tenga la estructura esperada
    if (!data || !data.token || !data.user) {
      console.error("Respuesta del servidor:", data);
      throw new Error("Respuesta del servidor inválida");
    }

    // Devolver los datos en el formato que espera el frontend
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error("Error en ingresar:", error);
    throw error;
  }
};

/** Registrar usuario */
export const registrar = async ({ nombre, email, pass, telefono }) => {
  try {
    // Validar datos antes de enviar
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

    // Debug para desarrollo
    console.log("Respuesta del registro:", data);

    if (!data || !data.user) {
      console.error("Estructura de respuesta inválida:", data);
      throw new Error("Respuesta del servidor inválida");
    }

    // Devolver los datos en el formato que espera el frontend
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

/** Obtener perfil propio */
export const getMiPerfil = async () => {
  const { data } = await api.get("/auth/perfil");
  return data;
};

/** Actualizar perfil propio */
export const updateMiPerfil = async ({ nombre, email, telefono, pass }) => {
  const payload = {};
  if (nombre) payload.nombre = nombre;
  if (email) payload.email = email;
  if (telefono !== undefined) payload.telefono = telefono;
  if (pass) payload.pass = pass;

  const { data } = await api.put("/auth/perfil", payload);
  return data;
};

/** Cambiar contraseña */
export const cambiarPassword = async ({ pass_actual, pass_nueva }) => {
  const { data } = await api.post("/auth/cambiar-password", {
    pass_actual,
    pass_nueva,
  });
  return data;
};

/** Eliminar mi cuenta */
export const deleteMiCuenta = async () => {
  const { data } = await api.delete("/auth/cuenta");
  return data;
};

/** Obtener perfil público de barbero */
export const getPerfilBarbero = async (id) => {
  const { data } = await api.get(`/usuarios/barberos/${id}/perfil`);
  return data;
};
