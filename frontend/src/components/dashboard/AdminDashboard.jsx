// frontend/src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  BarChart2,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Key,
  Mail,
  List,
  CalendarPlus,
  DollarSign,
  Download,
} from "lucide-react";
import DashboardShell from "./DashboardShell";
import {
  getDashboard,
  getServiciosTop,
  getClientesTop,
  getDistribucionHoraria,
  getTasaCancelacion,
  getReporteIngresos,
} from "../../services/citaService";
import {
  getUsuarios,
  asignarRol,
  deleteUsuario,
  updateUsuarioById,
  cambiarPasswordAdmin,
  createUsuarioAdmin,
  getHorarioBarbero,
  setHorarioBarbero,
  deleteHorarioBarbero,
} from "../../services/usuarioService";
import {
  getServicios,
  toggleActivoServicio,
  eliminarServicio,
  crearServicio,
  actualizarServicio,
} from "../../services/servicioService";
import {
  getMensajesContacto,
  marcarMensajeLeido,
} from "../../services/contactoService";
import { UserCitasModal } from "../admin/UserCitasModal";
import VistaCitasAdmin from "./VistaCitasAdmin";
import VistaTodasLasCitas from "../admin/VistaTodasLasCitas";
import { AdminCrearCita } from "./AdminCrearCita";

/**
 * Componente Spinner - Indicador de carga
 */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <RefreshCw size={20} className="animate-spin text-amber-400" />
    </div>
  );
}

/**
 * Componente ErrorBanner - Muestra mensajes de error
 */
function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      <AlertCircle size={16} /> {msg}
    </div>
  );
}

/**
 * Componente Modal - Ventana modal reutilizable
 */
function Modal({ isOpen, onClose, children, titulo }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-bold text-gray-900 dark:text-white">{titulo}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// VISTA INICIO
// ============================================

/**
 * VistaInicio - Panel principal con estadísticas del negocio
 */
function VistaInicio() {
  const [stats, setStats] = useState(null);
  const [serviciosTop, setServiciosTop] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [d, s, c] = await Promise.all([
          getDashboard(),
          getServiciosTop(5),
          getClientesTop(5),
        ]);
        setStats(d.dashboard);
        setServiciosTop(s.servicios || []);
        setClientesTop(c.clientes || []);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  const cards = [
    {
      label: "Citas hoy",
      value: stats?.citas_hoy,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Pendientes",
      value: stats?.citas_pendientes,
      icon: Clock,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      label: "Ingresos mes",
      value: `$${Number(stats?.ingresos_mes || 0).toLocaleString()}`,
      icon: TrendingUp,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Clientes",
      value: stats?.clientes_totales,
      icon: Users,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      sub: `${stats?.barberos_activos} barberos activos`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {c.label}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.color}`}
              >
                <c.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {c.value ?? "—"}
            </p>
            {c.sub && <p className="text-xs text-gray-400 mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Servicios más solicitados
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {serviciosTop.length === 0 && (
              <p className="text-sm text-gray-400 px-5 py-4">Sin datos aún</p>
            )}
            {serviciosTop.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs font-bold text-gray-400 w-4">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {s.nombre}
                  </p>
                  <p className="text-xs text-gray-400">
                    ${s.precio} · {s.duracion} min
                  </p>
                </div>
                <span className="text-sm font-semibold text-amber-500">
                  {s.total_citas} citas
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Clientes frecuentes
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {clientesTop.length === 0 && (
              <p className="text-sm text-gray-400 px-5 py-4">Sin datos aún</p>
            )}
            {clientesTop.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                  {c.nombre?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {c.nombre}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c.total_citas} visitas · $
                    {Number(c.total_gastado || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VISTA USUARIOS
// ============================================

/**
 * VistaUsuarios - Gestión completa de usuarios del sistema
 */
function VistaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroRol, setFiltroRol] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [citasModal, setCitasModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "cliente",
    pass: "",
  });
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "",
  });
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsuarios({
        rol: filtroRol || undefined,
        search: busqueda || undefined,
      });
      setUsuarios(res.usuarios || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtroRol]);

  const handleBuscar = (e) => {
    if (e.key === "Enter") cargar();
  };

  const handleCambiarRol = async (id, nuevoRol) => {
    try {
      await asignarRol(id, nuevoRol);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await deleteUsuario(id);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleCrearUsuario = async () => {
    if (!formData.nombre || !formData.email || !formData.pass) {
      alert("Nombre, email y contraseña son obligatorios");
      return;
    }
    setCargando(true);
    try {
      await createUsuarioAdmin(formData);
      setModalOpen(false);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        rol: "cliente",
        pass: "",
      });
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEditarUsuario = async () => {
    setCargando(true);
    try {
      await updateUsuarioById(usuarioSeleccionado.id, editFormData);
      setModalEditarOpen(false);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarPassword = async () => {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setCargando(true);
    try {
      await cambiarPasswordAdmin(usuarioSeleccionado.id, nuevaPassword);
      setModalPasswordOpen(false);
      setNuevaPassword("");
      alert("Contraseña actualizada exitosamente");
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setEditFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || "",
      rol: usuario.rol,
    });
    setModalEditarOpen(true);
  };

  const abrirPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevaPassword("");
    setModalPasswordOpen(true);
  };

  const rolColor = {
    admin:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    barbero:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    cliente: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={handleBuscar}
          className="flex-1 border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="barbero">Barbero</option>
          <option value="cliente">Cliente</option>
        </select>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          <UserPlus size={16} /> Nuevo Usuario
        </button>
      </div>

      {loading && <Spinner />}
      {error && <ErrorBanner msg={error} />}

      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Usuarios
            </h2>
            <span className="text-xs text-gray-400">
              {usuarios.length} registros
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {usuarios.length === 0 && (
              <p className="text-sm text-gray-400 px-5 py-4">Sin resultados</p>
            )}
            {usuarios.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  {u.nombre?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {u.nombre}
                  </p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  {u.telefono && (
                    <p className="text-xs text-gray-500">{u.telefono}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.rol}
                    onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${rolColor[u.rol]} cursor-pointer`}
                  >
                    <option value="admin">admin</option>
                    <option value="barbero">barbero</option>
                    <option value="cliente">cliente</option>
                  </select>
                  <button
                    onClick={() =>
                      setCitasModal({
                        open: true,
                        userId: u.id,
                        userName: u.nombre,
                      })
                    }
                    className="text-green-400 hover:text-green-600 transition-colors"
                    title="Ver historial de citas"
                  >
                    <Calendar size={14} />
                  </button>
                  <button
                    onClick={() => abrirEditar(u)}
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                    title="Editar datos"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => abrirPassword(u)}
                    className="text-amber-400 hover:text-amber-600 transition-colors"
                    title="Cambiar contraseña"
                  >
                    <Key size={14} />
                  </button>
                  <button
                    onClick={() => handleEliminar(u.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo="Crear Nuevo Usuario"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre completo *"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <input
            type="password"
            placeholder="Contraseña *"
            value={formData.pass}
            onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <select
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          >
            <option value="cliente">Cliente</option>
            <option value="barbero">Barbero</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            onClick={handleCrearUsuario}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {cargando ? "Creando..." : "Crear Usuario"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        titulo="Editar Usuario"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={editFormData.nombre}
            onChange={(e) =>
              setEditFormData({ ...editFormData, nombre: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <input
            type="email"
            placeholder="Email"
            value={editFormData.email}
            onChange={(e) =>
              setEditFormData({ ...editFormData, email: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={editFormData.telefono}
            onChange={(e) =>
              setEditFormData({ ...editFormData, telefono: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <select
            value={editFormData.rol}
            onChange={(e) =>
              setEditFormData({ ...editFormData, rol: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          >
            <option value="cliente">Cliente</option>
            <option value="barbero">Barbero</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            onClick={handleEditarUsuario}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {cargando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalPasswordOpen}
        onClose={() => setModalPasswordOpen(false)}
        titulo="Cambiar Contraseña"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Usuario: <strong>{usuarioSeleccionado?.nombre}</strong>
          </p>
          <input
            type="password"
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <button
            onClick={handleCambiarPassword}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {cargando ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </div>
      </Modal>

      <UserCitasModal
        isOpen={citasModal.open}
        onClose={() =>
          setCitasModal({ open: false, userId: null, userName: "" })
        }
        userId={citasModal.userId}
        userName={citasModal.userName}
      />
    </div>
  );
}

// ============================================
// VISTA SERVICIOS
// ============================================

/**
 * VistaServicios - Gestión de servicios ofrecidos
 */
function VistaServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    duracion: 30,
    precio: 0,
    activo: true,
  });
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    descripcion: "",
    duracion: 30,
    precio: 0,
    activo: true,
  });
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getServicios(false);
      setServicios(res.servicios || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleToggle = async (id) => {
    try {
      await toggleActivoServicio(id);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este servicio? Se eliminarán las citas asociadas."))
      return;
    try {
      await eliminarServicio(id);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleCrearServicio = async () => {
    if (!formData.nombre || formData.duracion <= 0 || formData.precio <= 0) {
      alert("Nombre, duración y precio son obligatorios y deben ser válidos");
      return;
    }
    setCargando(true);
    try {
      await crearServicio(formData);
      setModalOpen(false);
      setFormData({
        nombre: "",
        descripcion: "",
        duracion: 30,
        precio: 0,
        activo: true,
      });
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEditarServicio = async () => {
    setCargando(true);
    try {
      await actualizarServicio(servicioSeleccionado.id, editFormData);
      setModalEditarOpen(false);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirEditar = (servicio) => {
    setServicioSeleccionado(servicio);
    setEditFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || "",
      duracion: servicio.duracion,
      precio: servicio.precio,
      activo: servicio.activo,
    });
    setModalEditarOpen(true);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
      >
        <Plus size={16} /> Nuevo Servicio
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Servicios
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {servicios.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {s.nombre}
                </p>
                <p className="text-xs text-gray-400">
                  ${s.precio} · {s.duracion} min
                  {s.descripcion && (
                    <span className="ml-2">- {s.descripcion}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirEditar(s)}
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleToggle(s.id)}
                  className={`${s.activo ? "text-green-500" : "text-gray-400"} hover:opacity-70 transition`}
                  title={s.activo ? "Desactivar" : "Activar"}
                >
                  {s.activo ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                </button>
                <button
                  onClick={() => handleEliminar(s.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo="Crear Nuevo Servicio"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del servicio *"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            rows="2"
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Duración (min) *"
              value={formData.duracion}
              onChange={(e) =>
                setFormData({ ...formData, duracion: parseInt(e.target.value) })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
            />
            <input
              type="number"
              placeholder="Precio *"
              value={formData.precio}
              onChange={(e) =>
                setFormData({ ...formData, precio: parseFloat(e.target.value) })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) =>
                setFormData({ ...formData, activo: e.target.checked })
              }
            />
            <span className="text-sm">Activo</span>
          </label>
          <button
            onClick={handleCrearServicio}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {cargando ? "Creando..." : "Crear Servicio"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        titulo="Editar Servicio"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={editFormData.nombre}
            onChange={(e) =>
              setEditFormData({ ...editFormData, nombre: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <textarea
            placeholder="Descripción"
            value={editFormData.descripcion}
            onChange={(e) =>
              setEditFormData({ ...editFormData, descripcion: e.target.value })
            }
            rows="2"
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Duración (min)"
              value={editFormData.duracion}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  duracion: parseInt(e.target.value),
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
            />
            <input
              type="number"
              placeholder="Precio"
              value={editFormData.precio}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  precio: parseFloat(e.target.value),
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-white/10"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editFormData.activo}
              onChange={(e) =>
                setEditFormData({ ...editFormData, activo: e.target.checked })
              }
            />
            <span className="text-sm">Activo</span>
          </label>
          <button
            onClick={handleEditarServicio}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {cargando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// VISTA HORARIOS
// ============================================

/**
 * VistaHorarios - Gestión de horarios laborales de los barberos
 */
function VistaHorarios() {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    dia_semana: "lunes",
    hora_inicio: "09:00",
    hora_fin: "18:00",
  });
  const [cargando, setCargando] = useState(false);

  const diasSemana = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];

  const cargarBarberos = async () => {
    setLoading(true);
    try {
      const res = await getUsuarios({ rol: "barbero" });
      setBarberos(res.usuarios || []);
      if (res.usuarios?.length > 0) {
        setBarberoSeleccionado(res.usuarios[0]);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarHorarios = async (barberoId) => {
    if (!barberoId) return;
    try {
      const res = await getHorarioBarbero(barberoId);
      setHorarios(res.horarios || []);
    } catch (e) {
      console.error("Error cargando horarios:", e);
      setHorarios([]);
    }
  };

  useEffect(() => {
    cargarBarberos();
  }, []);

  useEffect(() => {
    if (barberoSeleccionado) {
      cargarHorarios(barberoSeleccionado.id);
    }
  }, [barberoSeleccionado]);

  const handleGuardarHorario = async () => {
    if (!barberoSeleccionado) return;
    if (!formData.hora_inicio || !formData.hora_fin) {
      alert("Hora inicio y hora fin son requeridas");
      return;
    }
    setCargando(true);
    try {
      await setHorarioBarbero(barberoSeleccionado.id, {
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      });
      setModalOpen(false);
      setFormData({
        dia_semana: "lunes",
        hora_inicio: "09:00",
        hora_fin: "18:00",
      });
      cargarHorarios(barberoSeleccionado.id);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarHorario = async (dia) => {
    if (!barberoSeleccionado) return;
    if (!confirm(`¿Eliminar horario del ${dia}?`)) return;
    try {
      await deleteHorarioBarbero(barberoSeleccionado.id, dia);
      cargarHorarios(barberoSeleccionado.id);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const getHorarioPorDia = (dia) => horarios.find((h) => h.dia_semana === dia);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <select
          value={barberoSeleccionado?.id || ""}
          onChange={(e) => {
            const barbero = barberos.find(
              (b) => b.id === parseInt(e.target.value),
            );
            setBarberoSeleccionado(barbero);
          }}
          className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
        >
          <option value="">Seleccionar barbero</option>
          {barberos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!barberoSeleccionado}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Agregar horario
        </button>
      </div>

      {barberoSeleccionado && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold">
              Horarios de {barberoSeleccionado.nombre}
            </h2>
          </div>
          <div className="divide-y">
            {diasSemana.map((dia) => {
              const horario = getHorarioPorDia(dia);
              return (
                <div
                  key={dia}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span className="text-sm font-medium capitalize">{dia}</span>
                  {horario ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {horario.hora_inicio?.slice(0, 5)} -{" "}
                        {horario.hora_fin?.slice(0, 5)}
                      </span>
                      <button
                        onClick={() => handleEliminarHorario(dia)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No configurado
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo="Configurar horario"
      >
        <div className="space-y-3">
          <select
            value={formData.dia_semana}
            onChange={(e) =>
              setFormData({ ...formData, dia_semana: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
          >
            {diasSemana.map((dia) => (
              <option key={dia} value={dia}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) =>
                setFormData({ ...formData, hora_inicio: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            />
            <input
              type="time"
              value={formData.hora_fin}
              onChange={(e) =>
                setFormData({ ...formData, hora_fin: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            />
          </div>
          <button
            onClick={handleGuardarHorario}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {cargando ? "Guardando..." : "Guardar horario"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// VISTA MENSAJES
// ============================================

/**
 * VistaMensajes - Gestión de mensajes de contacto
 */
function VistaMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);

  const cargarMensajes = async () => {
    setLoading(true);
    try {
      const res = await getMensajesContacto(soloNoLeidos);
      setMensajes(res.mensajes || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, [soloNoLeidos]);

  const handleMarcarLeido = async (id) => {
    try {
      await marcarMensajeLeido(id);
      cargarMensajes();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <label className="flex items-center gap-2 text-sm text-black dark:text-white">
          <input
            type="checkbox"
            checked={soloNoLeidos}
            onChange={(e) => setSoloNoLeidos(e.target.checked)}
          />
          Solo no leídos
        </label>
        <span className="text-xs text-gray-400">
          {mensajes.length} mensajes
        </span>
      </div>

      <div className="space-y-3">
        {mensajes.length === 0 && (
          <p className="text-center text-gray-400 py-10">No hay mensajes</p>
        )}
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border ${!m.leido ? "border-amber-300 dark:border-amber-500" : "border-gray-100 dark:border-white/5"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{m.nombre}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
              {!m.leido && (
                <button
                  onClick={() => handleMarcarLeido(m.id)}
                  className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600"
                >
                  Marcar leído
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {m.mensaje}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(m.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// VISTA REPORTES (TASA CANCELACIÓN Y DISTRIBUCIÓN)
// ============================================

/**
 * VistaReportes - Reportes avanzados del negocio
 */
function VistaReportes() {
  const [distribucion, setDistribucion] = useState([]);
  const [tasaCancelacion, setTasaCancelacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (fechaInicio && fechaFin) {
        params.fecha_inicio = fechaInicio;
        params.fecha_fin = fechaFin;
      }
      const [dist, tasa] = await Promise.all([
        getDistribucionHoraria(params.fecha_inicio, params.fecha_fin),
        getTasaCancelacion(params.fecha_inicio, params.fecha_fin),
      ]);
      setDistribucion(dist.distribucion || []);
      setTasaCancelacion(tasa.reporte || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const aplicarFiltro = () => cargar();

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            />
          </div>
          <button
            onClick={aplicarFiltro}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600"
          >
            Aplicar filtro
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Distribución de citas por hora
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left">Hora</th>
                <th className="px-4 py-2 text-left">Total citas</th>
                <th className="px-4 py-2 text-left">Completadas</th>
                <th className="px-4 py-2 text-left">Canceladas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {distribucion.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-gray-400"
                  >
                    Sin datos
                  </td>
                </tr>
              )}
              {distribucion.map((h) => (
                <tr key={h.hora}>
                  <td className="px-4 py-2 font-medium">
                    {String(h.hora).padStart(2, "0")}:00
                  </td>
                  <td className="px-4 py-2">{h.total_citas}</td>
                  <td className="px-4 py-2 text-green-600">{h.completadas}</td>
                  <td className="px-4 py-2 text-red-600">{h.canceladas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Tasa de cancelación por barbero
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left">Barbero</th>
                <th className="px-4 py-2 text-left">Total citas</th>
                <th className="px-4 py-2 text-left">Canceladas</th>
                <th className="px-4 py-2 text-left">Tasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {tasaCancelacion.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-gray-400"
                  >
                    Sin datos
                  </td>
                </tr>
              )}
              {tasaCancelacion.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2 font-medium">{b.nombre}</td>
                  <td className="px-4 py-2">{b.total_citas}</td>
                  <td className="px-4 py-2 text-red-600">{b.canceladas}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${b.tasa_cancelacion > 30 ? "bg-red-100 text-red-700" : b.tasa_cancelacion > 15 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                    >
                      {b.tasa_cancelacion || 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VISTA REPORTE DE INGRESOS (NUEVA)
// ============================================

/**
 * VistaReporteIngresos - Reporte detallado de ingresos del negocio
 */
function VistaReporteIngresos() {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState("mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    setFechaFin(hoy.toISOString().split("T")[0]);
    setFechaInicio(hace30Dias.toISOString().split("T")[0]);
  }, []);

  const cargarReporte = async () => {
    if (!fechaInicio || !fechaFin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReporteIngresos(periodo, fechaInicio, fechaFin);
      if (data.ok) {
        setReporte(data);
      } else {
        setError(data.message || "Error al cargar reporte");
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarReporte();
    }
  }, [periodo, fechaInicio, fechaFin]);

  const exportarCSV = () => {
    if (!reporte?.reporte) return;
    setExportando(true);
    try {
      const rows = [
        [
          "Período",
          "Total Citas",
          "Ingreso Total",
          "Ticket Promedio",
          "Completadas",
          "Canceladas",
        ],
      ];
      reporte.reporte.forEach((item) => {
        rows.push([
          item.periodo,
          item.total_citas,
          `$${Number(item.ingreso_total || 0).toLocaleString()}`,
          `$${(Number(item.ticket_promedio) || 0).toFixed(2)}`,
          item.citas_completadas || 0,
          item.citas_canceladas || 0,
        ]);
      });
      const totalIngresos = reporte.reporte.reduce(
        (sum, item) => sum + (Number(item.ingreso_total) || 0),
        0,
      );
      const totalCitas = reporte.reporte.reduce(
        (sum, item) => sum + (item.total_citas || 0),
        0,
      );
      const totalCompletadas = reporte.reporte.reduce(
        (sum, item) => sum + (item.citas_completadas || 0),
        0,
      );
      const totalCanceladas = reporte.reporte.reduce(
        (sum, item) => sum + (item.citas_canceladas || 0),
        0,
      );
      rows.push([], ["RESUMEN", "", "", "", "", ""]);
      rows.push([
        "Total General",
        totalCitas,
        `$${totalIngresos.toLocaleString()}`,
        `$${(totalIngresos / (totalCompletadas || 1)).toFixed(2)}`,
        totalCompletadas,
        totalCanceladas,
      ]);
      const csvContent = rows.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `reporte_ingresos_${periodo}_${fechaInicio}_a_${fechaFin}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error al exportar: " + e.message);
    } finally {
      setExportando(false);
    }
  };

  const totales = reporte?.reporte?.reduce(
    (sum, item) => ({
      ingresos: sum.ingresos + (Number(item.ingreso_total) || 0),
      citas: sum.citas + (item.total_citas || 0),
      completadas: sum.completadas + (item.citas_completadas || 0),
      canceladas: sum.canceladas + (item.citas_canceladas || 0),
    }),
    { ingresos: 0, citas: 0, completadas: 0, canceladas: 0 },
  ) || { ingresos: 0, citas: 0, completadas: 0, canceladas: 0 };

  const ticketPromedio =
    totales.completadas > 0 ? totales.ingresos / totales.completadas : 0;

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-40">
            <label className="text-xs text-gray-500">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            >
              <option value="dia">Día</option>
              <option value="mes">Mes</option>
              <option value="año">Año</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700"
            />
          </div>
          <button
            onClick={exportarCSV}
            disabled={exportando || !reporte?.reporte?.length}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
          >
            <Download size={16} />{" "}
            {exportando ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Ingresos Totales</span>
            <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totales.ingresos.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totales.citas} citas en total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Citas Completadas</span>
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totales.completadas}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totales.canceladas} canceladas
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Ticket Promedio</span>
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${ticketPromedio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">por cita completada</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Tasa de Éxito</span>
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
              <BarChart2 size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totales.citas > 0
              ? ((totales.completadas / totales.citas) * 100).toFixed(1)
              : 0}
            %
          </p>
          <p className="text-xs text-gray-400 mt-1">de citas completadas</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">
            Ingresos por{" "}
            {periodo === "dia" ? "Día" : periodo === "mes" ? "Mes" : "Año"}
          </h2>
          <span className="text-xs text-gray-400">
            {reporte?.reporte?.length || 0} períodos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left">
                  {periodo === "dia"
                    ? "Fecha"
                    : periodo === "mes"
                      ? "Mes"
                      : "Año"}
                </th>
                <th className="px-4 py-2 text-center">Total Citas</th>
                <th className="px-4 py-2 text-center">Completadas</th>
                <th className="px-4 py-2 text-center">Canceladas</th>
                <th className="px-4 py-2 text-center">Ticket Promedio</th>
                <th className="px-4 py-2 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(!reporte?.reporte || reporte.reporte.length === 0) && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-400"
                  >
                    No hay datos
                  </td>
                </tr>
              )}
              {reporte?.reporte?.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="px-4 py-2 font-medium">{item.periodo}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                      {item.total_citas}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-green-600">
                    {item.citas_completadas || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-red-600">
                    {item.citas_canceladas || 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    ${(Number(item.ticket_promedio) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-green-600">
                    ${(Number(item.ingreso_total) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
              <tr>
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-center">{totales.citas}</td>
                <td className="px-4 py-2 text-center text-green-600">
                  {totales.completadas}
                </td>
                <td className="px-4 py-2 text-center text-red-600">
                  {totales.canceladas}
                </td>
                <td className="px-4 py-2 text-center">
                  ${ticketPromedio.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right font-bold text-green-600">
                  ${totales.ingresos.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Información del reporte:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>
                Período seleccionado:{" "}
                <strong>
                  {periodo === "dia"
                    ? "Diario"
                    : periodo === "mes"
                      ? "Mensual"
                      : "Anual"}
                </strong>
              </li>
              <li>
                Rango de fechas: <strong>{fechaInicio}</strong> al{" "}
                <strong>{fechaFin}</strong>
              </li>
              <li>
                Solo se incluyen citas en estado <strong>completada</strong> o{" "}
                <strong>confirmada</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const VISTAS = {
  inicio: "Resumen",
  usuarios: "Usuarios",
  servicios: "Servicios",
  horarios: "Horarios",
  citas: "Citas por barbero",
  crearCita: "Crear Cita",
  todasCitas: "Gestión Global de Citas",
  mensajes: "Mensajes",
  reportes: "Reportes",
  reporteIngresos: "Reporte de Ingresos",
};

export default function AdminDashboard() {
  const [vista, setVista] = useState("inicio");

  const navItems = [
    {
      name: "Resumen",
      icon: <LayoutDashboard size={16} />,
      onClick: () => setVista("inicio"),
    },
    {
      name: "Usuarios",
      icon: <Users size={16} />,
      onClick: () => setVista("usuarios"),
    },
    {
      name: "Servicios",
      icon: <Scissors size={16} />,
      onClick: () => setVista("servicios"),
    },
    {
      name: "Horarios",
      icon: <Clock size={16} />,
      onClick: () => setVista("horarios"),
    },
    {
      name: "Citas por barbero",
      icon: <Calendar size={16} />,
      onClick: () => setVista("citas"),
    },
    {
      name: "Crear Cita",
      icon: <CalendarPlus size={16} />,
      onClick: () => setVista("crearCita"),
    },
    {
      name: "Gestión Global",
      icon: <List size={16} />,
      onClick: () => setVista("todasCitas"),
    },
    {
      name: "Mensajes",
      icon: <Mail size={16} />,
      onClick: () => setVista("mensajes"),
    },
    {
      name: "Reportes",
      icon: <BarChart2 size={16} />,
      onClick: () => setVista("reportes"),
    },
    {
      name: "Reporte Ingresos",
      icon: <DollarSign size={16} />,
      onClick: () => setVista("reporteIngresos"),
    },
  ];

  return (
    <DashboardShell navItems={navItems} titulo={VISTAS[vista]}>
      {vista === "inicio" && <VistaInicio />}
      {vista === "usuarios" && <VistaUsuarios />}
      {vista === "servicios" && <VistaServicios />}
      {vista === "horarios" && <VistaHorarios />}
      {vista === "citas" && <VistaCitasAdmin />}
      {vista === "crearCita" && (
        <AdminCrearCita onCitaCreada={() => console.log("Cita creada")} />
      )}
      {vista === "todasCitas" && <VistaTodasLasCitas />}
      {vista === "mensajes" && <VistaMensajes />}
      {vista === "reportes" && <VistaReportes />}
      {vista === "reporteIngresos" && <VistaReporteIngresos />}
    </DashboardShell>
  );
}
