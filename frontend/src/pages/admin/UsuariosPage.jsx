// frontend/src/pages/admin/UsuariosPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  UserCog,
  Key,
} from "lucide-react";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  asignarRol,
  cambiarPasswordAdmin,
} from "../../services/usuarioService";
import { Modal } from "../../components/ui/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  validarEmail,
  validarNombre,
  validarPassword,
} from "../../utils/validaciones";

const roles = [
  { value: "cliente", label: "Cliente", color: "bg-blue-100 text-blue-700" },
  { value: "barbero", label: "Barbero", color: "bg-green-100 text-green-700" },
  {
    value: "admin",
    label: "Administrador",
    color: "bg-purple-100 text-purple-700",
  },
];

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cambiandoRol, setCambiandoRol] = useState(null);
  const [cambiandoPass, setCambiandoPass] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    pass: "",
    telefono: "",
    rol: "cliente",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getUsuarios({ search: search || undefined });
      setUsuarios(res.usuarios || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [search]);

  const validarForm = () => {
    const newErrors = {};
    const errorNombre = validarNombre(formData.nombre);
    if (errorNombre) newErrors.nombre = errorNombre;
    const errorEmail = validarEmail(formData.email);
    if (errorEmail) newErrors.email = errorEmail;
    if (!editando && formData.pass) {
      const errorPass = validarPassword(formData.pass);
      if (errorPass) newErrors.pass = errorPass;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarForm()) return;
    setSubmitting(true);
    try {
      if (editando) {
        const updates = {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
        };
        if (formData.pass) updates.pass = formData.pass;
        await updateUsuario(editando.id, updates);
      } else {
        await createUsuario(formData);
      }
      await cargarUsuarios();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      alert(error.response?.data?.message || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await deleteUsuario(eliminando.id);
      await cargarUsuarios();
      setEliminando(null);
    } catch (error) {
      console.error("Error eliminando:", error);
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  const handleCambiarRol = async (usuario, nuevoRol) => {
    try {
      await asignarRol(usuario.id, nuevoRol);
      await cargarUsuarios();
      setCambiandoRol(null);
    } catch (error) {
      console.error("Error cambiando rol:", error);
      alert(error.response?.data?.message || "Error al cambiar rol");
    }
  };

  const handleCambiarPassword = async (usuario) => {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await cambiarPasswordAdmin(usuario.id, nuevaPassword);
      alert("Contraseña actualizada exitosamente");
      setCambiandoPass(null);
      setNuevaPassword("");
    } catch (error) {
      console.error("Error cambiando password:", error);
      alert(error.response?.data?.message || "Error al cambiar contraseña");
    }
  };

  const resetForm = () => {
    setEditando(null);
    setFormData({
      nombre: "",
      email: "",
      pass: "",
      telefono: "",
      rol: "cliente",
    });
    setErrors({});
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setEditando(usuario);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        pass: "",
        telefono: usuario.telefono || "",
        rol: usuario.rol,
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuarios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-amber-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors"
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {usuarios.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.rol}
                      onChange={(e) => handleCambiarRol(user, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-amber-400 ${
                        user.rol === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.rol === "barbero"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.telefono || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setCambiandoPass(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        title="Cambiar contraseña"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => abrirModal(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setEliminando(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usuarios.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

      {/* Modal de usuario */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? "Editar usuario" : "Nuevo usuario"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña {!editando && "*"}
            </label>
            <input
              type="password"
              value={formData.pass}
              onChange={(e) =>
                setFormData({ ...formData, pass: e.target.value })
              }
              placeholder={
                editando ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"
              }
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.pass && (
              <p className="text-red-500 text-xs mt-1">{errors.pass}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-amber-400 text-gray-900 py-2 rounded-lg font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {submitting ? "Guardando..." : editando ? "Actualizar" : "Crear"}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmModal
        isOpen={!!eliminando}
        onClose={() => setEliminando(null)}
        onConfirm={handleEliminar}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar a "${eliminando?.nombre}"? Esta acción no se puede deshacer.`}
      />

      {/* Modal cambio de contraseña */}
      <Modal
        isOpen={!!cambiandoPass}
        onClose={() => setCambiandoPass(null)}
        title={`Cambiar contraseña - ${cambiandoPass?.nombre}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nueva contraseña *
            </label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleCambiarPassword(cambiandoPass)}
              className="flex-1 bg-amber-400 text-gray-900 py-2 rounded-lg font-semibold hover:bg-amber-300 transition-colors"
            >
              Cambiar contraseña
            </button>
            <button
              onClick={() => setCambiandoPass(null)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsuariosPage;
