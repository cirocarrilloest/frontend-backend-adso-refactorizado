// frontend/src/components/MiPerfil.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMiPerfil, cambiarPassword } from "../services/authService";

export const MiPerfil = () => {
  const { usuario, guardarSesion } = useAuth();
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || "",
    email: usuario?.email || "",
    telefono: usuario?.telefono || "",
  });
  const [passwordData, setPasswordData] = useState({
    pass_actual: "",
    pass_nueva: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePerfilChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdatePerfil = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const data = await updateMiPerfil(formData);
      const token = localStorage.getItem("token");
      guardarSesion(token, data.usuario);
      setMessage({ type: "success", text: "Perfil actualizado exitosamente" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.pass_actual || !passwordData.pass_nueva) {
      setMessage({ type: "error", text: "Ambas contraseñas son requeridas" });
      return;
    }
    if (passwordData.pass_nueva.length < 6) {
      setMessage({
        type: "error",
        text: "La nueva contraseña debe tener al menos 6 caracteres",
      });
      return;
    }
    setLoading(true);
    try {
      await cambiarPassword(passwordData);
      setMessage({
        type: "success",
        text: "Contraseña actualizada exitosamente",
      });
      setPasswordData({ pass_actual: "", pass_nueva: "" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {message.text && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Datos personales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Mis Datos
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handlePerfilChange}
            className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handlePerfilChange}
            className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handlePerfilChange}
            className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleUpdatePerfil}
            disabled={loading}
            className="w-full bg-amber-500 text-gray-900 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Actualizar Datos"}
          </button>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Cambiar Contraseña
        </h3>
        <div className="space-y-3">
          <input
            type="password"
            name="pass_actual"
            placeholder="Contraseña actual"
            value={passwordData.pass_actual}
            onChange={handlePasswordChange}
            className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            name="pass_nueva"
            placeholder="Nueva contraseña"
            value={passwordData.pass_nueva}
            onChange={handlePasswordChange}
            className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Cambiar Contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
};
