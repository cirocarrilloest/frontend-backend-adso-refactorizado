// frontend/src/components/PerfilUsuario.jsx
import React, { useState, useEffect } from "react";
import { getMiPerfil } from "../services/usuarioService";
import { useAuth } from "../context/AuthContext";
import { EditarPerfilModal } from "./EditarPerfilModal";
import { Spinner } from "./ui/Spinner";
import { ErrorBanner } from "./ui/ErrorBanner";
import { User, Mail, Phone, Calendar, Edit } from "lucide-react";

export const PerfilUsuario = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const { usuario, guardarSesion } = useAuth();

  const cargarPerfil = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMiPerfil();
      setPerfil(response.usuario);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handlePerfilActualizado = (usuarioActualizado) => {
    setPerfil(usuarioActualizado);
    guardarSesion(localStorage.getItem("token"), usuarioActualizado);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-4">
                  <User size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {perfil?.nombre}
                  </h1>
                  <p className="text-blue-100 capitalize">{perfil?.rol}</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                Editar perfil
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Mail className="text-gray-500 dark:text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Correo electrónico
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {perfil?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Phone className="text-gray-500 dark:text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Teléfono
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {perfil?.telefono || "No registrado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Calendar
                className="text-gray-500 dark:text-gray-400"
                size={20}
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Miembro desde
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {perfil?.fecha_registro
                    ? new Date(perfil.fecha_registro).toLocaleDateString(
                        "es-ES",
                      )
                    : "Reciente"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditarPerfilModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        usuarioActual={perfil}
        onPerfilActualizado={handlePerfilActualizado}
      />
    </>
  );
};
