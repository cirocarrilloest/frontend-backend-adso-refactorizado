// frontend/src/components/dashboard/PerfilView.jsx
import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Edit, Save, X, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getMiPerfil,
  updateMiPerfil,
  cambiarPassword,
} from "../../services/usuarioService";
import EliminarCuenta from "./EliminarCuenta";
function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      <span>⚠️</span> {msg}
    </div>
  );
}

function SuccessBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
      <span>✓</span> {msg}
    </div>
  );
}

export default function PerfilView() {
  const { usuario, guardarSesion } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para edición
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Estados para cambio de contraseña
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [passData, setPassData] = useState({
    pass_actual: "",
    pass_nueva: "",
    pass_confirmar: "",
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);

  // Cargar perfil
  const cargarPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMiPerfil();
      setPerfil(response.usuario);
      setFormData({
        nombre: response.usuario.nombre || "",
        email: response.usuario.email || "",
        telefono: response.usuario.telefono || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error al cargar perfil",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  // Manejar cambio en formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setEditError(null);
    setEditSuccess(null);
  };

  // Guardar cambios del perfil
  const handleGuardarPerfil = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      setEditError("El nombre es requerido");
      return;
    }
    if (!formData.email.trim()) {
      setEditError("El email es requerido");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setEditError("El email no es válido");
      return;
    }

    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const response = await updateMiPerfil({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
      });

      setEditSuccess("Perfil actualizado exitosamente");
      setPerfil(response.usuario);

      // Actualizar contexto de autenticación
      guardarSesion(localStorage.getItem("token"), response.usuario);

      // Cerrar edición después de 1.5 segundos
      setTimeout(() => {
        setEditando(false);
        setEditSuccess(null);
      }, 1500);
    } catch (err) {
      setEditError(err.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setEditLoading(false);
    }
  };

  // Manejar cambio en formulario de contraseña
  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({ ...prev, [name]: value }));
    setPassError(null);
    setPassSuccess(null);
  };

  // Cambiar contraseña
  const handleCambiarPassword = async () => {
    // Validaciones
    if (!passData.pass_actual) {
      setPassError("Ingresa tu contraseña actual");
      return;
    }
    if (!passData.pass_nueva) {
      setPassError("Ingresa una nueva contraseña");
      return;
    }
    if (passData.pass_nueva.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (passData.pass_nueva !== passData.pass_confirmar) {
      setPassError("Las contraseñas nuevas no coinciden");
      return;
    }

    setPassLoading(true);
    setPassError(null);
    setPassSuccess(null);

    try {
      await cambiarPassword({
        pass_actual: passData.pass_actual,
        pass_nueva: passData.pass_nueva,
      });

      setPassSuccess("Contraseña actualizada exitosamente");
      setPassData({
        pass_actual: "",
        pass_nueva: "",
        pass_confirmar: "",
      });

      setTimeout(() => {
        setMostrarCambioPass(false);
        setPassSuccess(null);
      }, 2000);
    } catch (err) {
      setPassError(
        err.response?.data?.message || "Error al cambiar contraseña",
      );
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-5">
      {/* Tarjeta de perfil */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-4">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {perfil?.nombre}
                </h2>
                <p className="text-amber-100 text-sm capitalize">
                  {perfil?.rol}
                </p>
              </div>
            </div>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Edit size={16} /> Editar
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {editando ? (
            // Modo edición
            <div className="space-y-4">
              <ErrorBanner msg={editError} />
              <SuccessBanner msg={editSuccess} />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleEditChange}
                  className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleEditChange}
                  className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleEditChange}
                  className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleGuardarPerfil}
                  disabled={editLoading}
                  className="flex-1 bg-amber-400 text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {editLoading ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  onClick={() => {
                    setEditando(false);
                    setEditError(null);
                    setEditSuccess(null);
                    setFormData({
                      nombre: perfil?.nombre || "",
                      email: perfil?.email || "",
                      telefono: perfil?.telefono || "",
                    });
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            // Modo visualización
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Mail className="text-gray-500 dark:text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Correo electrónico
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {perfil?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Phone className="text-gray-500 dark:text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Teléfono
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {perfil?.telefono || (
                      <span className="text-gray-400 italic">
                        No registrado
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <Calendar
                  className="text-gray-500 dark:text-gray-400"
                  size={20}
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Miembro desde
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {perfil?.fecha_registro
                      ? new Date(perfil.fecha_registro).toLocaleDateString(
                          "es-CO",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "Reciente"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de contraseña */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Cambiar contraseña
            </h3>
          </div>
          {!mostrarCambioPass && (
            <button
              onClick={() => setMostrarCambioPass(true)}
              className="text-sm text-amber-500 hover:text-amber-600 transition-colors"
            >
              Cambiar
            </button>
          )}
        </div>

        {mostrarCambioPass && (
          <div className="p-6 space-y-4">
            <ErrorBanner msg={passError} />
            <SuccessBanner msg={passSuccess} />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña actual *
              </label>
              <input
                type="password"
                name="pass_actual"
                value={passData.pass_actual}
                onChange={handlePassChange}
                className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva contraseña *
              </label>
              <input
                type="password"
                name="pass_nueva"
                value={passData.pass_nueva}
                onChange={handlePassChange}
                className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar nueva contraseña *
              </label>
              <input
                type="password"
                name="pass_confirmar"
                value={passData.pass_confirmar}
                onChange={handlePassChange}
                className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Repite la nueva contraseña"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCambiarPassword}
                disabled={passLoading}
                className="flex-1 bg-amber-400 text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {passLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                ) : (
                  <Lock size={16} />
                )}
                {passLoading ? "Actualizando..." : "Actualizar contraseña"}
              </button>
              <button
                onClick={() => {
                  setMostrarCambioPass(false);
                  setPassError(null);
                  setPassSuccess(null);
                  setPassData({
                    pass_actual: "",
                    pass_nueva: "",
                    pass_confirmar: "",
                  });
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      <EliminarCuenta />
    </div>
  );
}
