// frontend/src/components/EditarPerfilModal.jsx
import React, { useState, useEffect } from "react";
import { updateMiPerfil } from "../services/usuarioService";
import { useAuth } from "../context/AuthContext";
import { Modal } from "./ui/Modal";
import { ErrorBanner } from "./ui/ErrorBanner";

export const EditarPerfilModal = ({
  isOpen,
  onClose,
  usuarioActual,
  onPerfilActualizado,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    pass: "",
    confirmarPass: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { guardarSesion } = useAuth();

  // Cargar datos actuales cuando se abre el modal
  useEffect(() => {
    if (usuarioActual && isOpen) {
      setFormData({
        nombre: usuarioActual.nombre || "",
        email: usuarioActual.email || "",
        telefono: usuarioActual.telefono || "",
        pass: "",
        confirmarPass: "",
      });
    }
  }, [usuarioActual, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!formData.email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("El email no es válido");
      return;
    }

    if (formData.pass && formData.pass.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.pass !== formData.confirmarPass) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const dataToSend = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
      };

      if (formData.pass) {
        dataToSend.pass = formData.pass;
      }

      const response = await updateMiPerfil(dataToSend);

      setSuccess("Perfil actualizado exitosamente");

      // Actualizar el usuario en el contexto
      if (response.usuario) {
        guardarSesion(localStorage.getItem("token"), response.usuario);
        if (onPerfilActualizado) {
          onPerfilActualizado(response.usuario);
        }
      }

      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <div className="space-y-4">
        <ErrorBanner message={error} />

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+1234567890"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Cambiar contraseña (opcional)
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                name="pass"
                value={formData.pass}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                name="confirmarPass"
                value={formData.confirmarPass}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};
