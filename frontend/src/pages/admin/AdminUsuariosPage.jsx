//frontend/src/pages/admin/AdminUsuariosPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  Users,
  Scissors,
  Shield,
  Filter,
  X,
  RefreshCw,
  User,
} from "lucide-react";
import { useUsuarios } from "../../hooks/useUsuarios";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Modal } from "../../components/ui/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";

// Roles disponibles para filtrado
const ROL_FILTERS = [
  { value: "todos", label: "Todos", icon: Users, color: "bg-gray-500" },
  { value: "cliente", label: "Clientes", icon: User, color: "bg-blue-500" },
  {
    value: "barbero",
    label: "Barberos",
    icon: Scissors,
    color: "bg-green-500",
  },
  {
    value: "admin",
    label: "Administradores",
    icon: Shield,
    color: "bg-purple-500",
  },
];

// Configuración visual por rol
const ROL_CONFIG = {
  cliente: {
    label: "Cliente",
    badgeColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  barbero: {
    label: "Barbero",
    badgeColor:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  admin: {
    label: "Administrador",
    badgeColor:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

// Tarjeta de estadística por rol
function RolStatCard({ rol, count, active, onClick, color }) {
  const config = ROL_FILTERS.find((r) => r.value === rol) || ROL_FILTERS[0];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onClick(rol)}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all w-full ${
        active
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600 shadow-md"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-600"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-left">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {count}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {config.label}
        </p>
      </div>
    </button>
  );
}

// Fila de usuario en la tabla
function UsuarioRow({
  usuario,
  onEdit,
  onDelete,
  onPassword,
  onRolChange,
  formatearFecha,
}) {
  const config = ROL_CONFIG[usuario.rol] || ROL_CONFIG.cliente;

  return (
    <tr className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {usuario.nombre?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {usuario.nombre}
            </p>
            <p className="text-xs text-gray-400">{usuario.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={usuario.rol}
          onChange={(e) => onRolChange(usuario, e.target.value)}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:ring-2 focus:ring-amber-400 ${config.badgeColor}`}
        >
          <option value="cliente">Cliente</option>
          <option value="barbero">Barbero</option>
          <option value="admin">Administrador</option>
        </select>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {usuario.telefono || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {formatearFecha(usuario.created_at || usuario.fecha_registro)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPassword(usuario)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Cambiar contraseña"
          >
            <Key size={15} />
          </button>
          <button
            onClick={() => onEdit(usuario)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Editar"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => onDelete(usuario)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsuariosPage() {
  const { addToast } = useToast();
  const {
    listar,
    crear,
    actualizar,
    eliminar,
    cambiarRol,
    cambiarPassword,
    getUserCounts,
    loading,
    error,
  } = useUsuarios();

  const [usuarios, setUsuarios] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    cliente: 0,
    barbero: 0,
    admin: 0,
  });
  const [rolActivo, setRolActivo] = useState("todos");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cambiandoPass, setCambiandoPass] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    pass: "",
    telefono: "",
    rol: "cliente",
  });

  // Ref para evitar múltiples cargas iniciales
  const initialLoadDone = useRef(false);

  // ✅ Función para cargar usuarios (sin depender de rolActivo/search para evitar bucle)
  const cargarUsuarios = useCallback(async () => {
    const params = {};
    if (rolActivo !== "todos") params.rol = rolActivo;
    if (search) params.search = search;
    const result = await listar(params);
    if (result) {
      setUsuarios(result.usuarios || []);
    }
  }, [listar, rolActivo, search]);

  // ✅ Función para cargar contadores
  const cargarCounts = useCallback(async () => {
    const result = await getUserCounts();
    if (result?.counts) {
      setCounts(result.counts);
    }
  }, [getUserCounts]);

  // ✅ useEffect CORREGIDO - Solo se ejecuta cuando cambian los filtros
  useEffect(() => {
    cargarUsuarios();
    cargarCounts();
  }, [rolActivo, search]); // ✅ Solo dependencias que realmente necesitan recargar

  // ✅ Efecto separado para la carga inicial (solo una vez)
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      cargarUsuarios();
      cargarCounts();
    }
  }, []); // ✅ Array vacío = solo se ejecuta una vez

  const handleBuscar = () => {
    setSearch(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email) {
      addToast("Nombre y email son requeridos", "error");
      return;
    }
    setSubmitting(true);
    let result;
    if (editando) {
      const updates = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        rol: formData.rol,
      };
      if (formData.pass && formData.pass.trim() !== "") {
        updates.pass = formData.pass;
      }
      result = await actualizar(editando.id, updates);
    } else {
      if (!formData.pass || formData.pass.length < 6) {
        addToast("La contraseña debe tener al menos 6 caracteres", "error");
        setSubmitting(false);
        return;
      }
      result = await crear(formData);
    }
    if (result) {
      addToast(
        editando
          ? "Usuario actualizado exitosamente"
          : "Usuario creado exitosamente",
        "success",
      );
      setModalOpen(false);
      resetForm();
      cargarUsuarios();
      cargarCounts();
    }
    setSubmitting(false);
  };

  const handleEliminar = async () => {
    const result = await eliminar(eliminando.id);
    if (result) {
      addToast("Usuario eliminado exitosamente", "success");
      setEliminando(null);
      cargarUsuarios();
      cargarCounts();
    }
  };

  const handleCambiarRol = async (usuario, nuevoRol) => {
    const result = await cambiarRol(usuario.id, nuevoRol);
    if (result) {
      addToast(`Rol cambiado a ${nuevoRol}`, "success");
      cargarUsuarios();
      cargarCounts();
    }
  };

  const handleCambiarPassword = async () => {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      addToast("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }
    const result = await cambiarPassword(cambiandoPass.id, nuevaPassword);
    if (result) {
      addToast("Contraseña actualizada exitosamente", "success");
      setCambiandoPass(null);
      setNuevaPassword("");
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

  const limpiarFiltros = () => {
    setRolActivo("todos");
    setSearch("");
    setSearchInput("");
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statsCards = [
    { rol: "todos", count: counts.total, color: "bg-gray-500" },
    { rol: "cliente", count: counts.cliente, color: "bg-blue-500" },
    { rol: "barbero", count: counts.barbero, color: "bg-green-500" },
    { rol: "admin", count: counts.admin, color: "bg-purple-500" },
  ];

  if (loading && !usuarios.length) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarUsuarios} />;

  const hayFiltrosActivos = rolActivo !== "todos" || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuarios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              cargarUsuarios();
              cargarCounts();
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-amber-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors"
          >
            <Plus size={16} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Stats Cards - Filtros por rol */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsCards.map((stat) => (
          <RolStatCard
            key={stat.rol}
            rol={stat.rol}
            count={stat.count}
            active={rolActivo === stat.rol}
            onClick={setRolActivo}
            color={stat.color}
          />
        ))}
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <button
          onClick={handleBuscar}
          className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          Buscar
        </button>
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={14} /> Limpiar filtros
          </button>
        )}
      </div>

      {/* Información de filtros activos */}
      {hayFiltrosActivos && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter size={12} />
          <span>Filtros activos:</span>
          {rolActivo !== "todos" && (
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Rol: {ROL_FILTERS.find((r) => r.value === rolActivo)?.label}
            </span>
          )}
          {search && (
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Búsqueda: "{search}"
            </span>
          )}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Registro
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="opacity-30" />
                      <p>No hay usuarios registrados</p>
                      {hayFiltrosActivos && (
                        <p className="text-xs">
                          Prueba cambiando los filtros de búsqueda
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <UsuarioRow
                    key={usuario.id}
                    usuario={usuario}
                    onEdit={abrirModal}
                    onDelete={setEliminando}
                    onPassword={setCambiandoPass}
                    onRolChange={handleCambiarRol}
                    formatearFecha={formatearFecha}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <option value="cliente">Cliente</option>
              <option value="barbero">Barbero</option>
              <option value="admin">Administrador</option>
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
              onClick={handleCambiarPassword}
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
}
