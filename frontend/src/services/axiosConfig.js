// frontend/src/services/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para añadir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error("Error response:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // Si es 401 (no autorizado), limpiar sesión
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        // No redirigir automáticamente, dejar que el componente maneje
      }
    } else if (error.request) {
      // La solicitud se hizo pero no hubo respuesta
      console.error("No response received:", error.request);
      error.message = "No se pudo conectar con el servidor";
    } else {
      // Algo más pasó
      console.error("Error config:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
