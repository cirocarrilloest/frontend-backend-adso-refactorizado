// frontend/src/services/usuarioService.js

import api from "./axiosConfig";

// PERFIL PROPIO (AUTH)

export const getMiPerfil = async () => {
  const { data } = await api.get("/auth/perfil");
  return data;
};

export const updateMiPerfil = async ({ nombre, email, telefono, pass }) => {
  const { data } = await api.put("/auth/perfil", {
    nombre,
    email,
    telefono,
    pass,
  });
  return data;
};

export const cambiarPassword = async ({ pass_actual, pass_nueva }) => {
  const { data } = await api.post("/auth/cambiar-password", {
    pass_actual,
    pass_nueva,
  });
  return data;
};

export const deleteMiCuenta = async () => {
  const { data } = await api.delete("/auth/cuenta");
  return data;
};

// BARBEROS

/**
 * Perfil público de un barbero con estadísticas y servicios frecuentes.
 */
export const getPerfilBarbero = async (id) => {
  const { data } = await api.get(`/usuarios/barberos/${id}/perfil`);
  return data;
};

export const getBarberos = async () => {
  const { data } = await api.get("/usuarios/barberos/listar");
  return data;
};

export const getHorarioBarbero = async (id) => {
  const { data } = await api.get(`/usuarios/barberos/${id}/horario`);
  return data;
};

// ADMIN — CRUD USUARIOS

export const getUsuarios = async ({ rol, search } = {}) => {
  const { data } = await api.get("/usuarios", { params: { rol, search } });
  return data;
};

export const getUsuarioById = async (id) => {
  const { data } = await api.get(`/usuarios/${id}`);
  return data;
};

export const createUsuario = async ({ nombre, email, pass, rol, telefono }) => {
  const { data } = await api.post("/usuarios", {
    nombre,
    email,
    pass,
    rol,
    telefono,
  });
  return data;
};
export const createUsuarioAdmin = createUsuario;

export const updateUsuario = async (id, campos) => {
  const { data } = await api.put(`/usuarios/${id}`, campos);
  return data;
};
export const updateUsuarioById = updateUsuario;

export const deleteUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};

export const asignarRol = async (id, rol) => {
  const { data } = await api.patch(`/usuarios/${id}/rol`, { rol });
  return data;
};

// Obtener citas de un usuario específico (admin)
export const getCitasDeUsuario = async (userId, estado = null) => {
  try {
    // Usar la instancia 'api' que ya está configurada
    const url =
      estado && estado !== "todos"
        ? `/usuarios/${userId}/citas?estado=${estado}`
        : `/usuarios/${userId}/citas`;

    const { data } = await api.get(url);
    return data;
  } catch (error) {
    console.error("Error al obtener citas del usuario:", error);
    throw error;
  }
};

export const cambiarPasswordAdmin = async (id, nuevaPassword) => {
  const { data } = await api.post(`/usuarios/${id}/cambiar-password`, {
    pass: nuevaPassword,
  });
  return data;
};

export const setHorarioBarbero = async (
  id,
  { dia_semana, hora_inicio, hora_fin },
) => {
  const { data } = await api.post(`/usuarios/barberos/${id}/horario`, {
    dia_semana,
    hora_inicio,
    hora_fin,
  });
  return data;
};

export const deleteHorarioBarbero = async (id, dia) => {
  const { data } = await api.delete(`/usuarios/barberos/${id}/horario/${dia}`);
  return data;
};
