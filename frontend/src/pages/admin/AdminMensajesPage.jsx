// frontend/src/pages/admin/AdminMensajesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  MessageSquare,
  Inbox,
  Calendar,
  User,
  AtSign,
  CheckCircle2,
} from "lucide-react";
import {
  getMensajesContacto,
  marcarMensajeLeido,
  eliminarMensaje,
} from "../../services/contactoService";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { useToast } from "../../context/ToastContext";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

// Componente de tarjeta de estadística
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Componente de mensaje individual
function MensajeCard({ mensaje, onLeer, onEliminar, formatearFecha }) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const esNoLeido = !mensaje.leido;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        esNoLeido
          ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50"
          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 hover:border-amber-200"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {mensaje.nombre?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {mensaje.nombre}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <AtSign size={10} /> {mensaje.email}
              </p>
            </div>
            {esNoLeido && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                <Mail size={10} /> Nuevo
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {esNoLeido && (
              <button
                onClick={() => onLeer(mensaje)}
                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
                title="Marcar como leído"
              >
                <Eye size={15} />
              </button>
            )}
            <button
              onClick={() => onEliminar(mensaje)}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Mensaje */}
        <div className="mb-3">
          <p
            className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${
              !showFullMessage && mensaje.mensaje?.length > 200
                ? "line-clamp-3"
                : ""
            }`}
          >
            {mensaje.mensaje}
          </p>
          {mensaje.mensaje?.length > 200 && (
            <button
              onClick={() => setShowFullMessage(!showFullMessage)}
              className="text-xs text-amber-500 hover:text-amber-600 mt-1"
            >
              {showFullMessage ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {formatearFecha(mensaje.fecha)}
            </span>
          </div>
          {mensaje.leido && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> Leído
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMensajesPage() {
  const { addToast } = useToast();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);
  const [eliminandoMensaje, setEliminandoMensaje] = useState(null);

  const cargarMensajes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMensajesContacto(soloNoLeidos);
      let lista = res.mensajes || [];

      // Filtrar por búsqueda en el frontend (ya que el backend no tiene búsqueda aún)
      if (search.trim()) {
        const term = search.toLowerCase();
        lista = lista.filter(
          (m) =>
            m.nombre?.toLowerCase().includes(term) ||
            m.email?.toLowerCase().includes(term) ||
            m.mensaje?.toLowerCase().includes(term),
        );
      }

      setMensajes(lista);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      addToast(
        e.response?.data?.message || "Error al cargar mensajes",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [soloNoLeidos, search, addToast]);

  useEffect(() => {
    cargarMensajes();
  }, [cargarMensajes]);

  const handleBuscar = () => {
    setSearch(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleMarcarLeido = async (mensaje) => {
    if (mensaje.leido) return;
    try {
      await marcarMensajeLeido(mensaje.id);
      addToast("Mensaje marcado como leído", "success");
      cargarMensajes();
    } catch (e) {
      addToast(
        e.response?.data?.message || "Error al marcar como leído",
        "error",
      );
    }
  };

  const handleEliminar = async (mensaje) => {
    try {
      await eliminarMensaje(mensaje.id);
      addToast("Mensaje eliminado exitosamente", "success");
      setEliminandoMensaje(null);
      cargarMensajes();
    } catch (e) {
      addToast(
        e.response?.data?.message || "Error al eliminar mensaje",
        "error",
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === ayer.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportarCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Mensaje", "Fecha", "Leído"];
    const rows = mensajes.map((m) => [
      m.id,
      m.nombre,
      m.email,
      `"${m.mensaje?.replace(/"/g, '""')}"`,
      m.fecha,
      m.leido ? "Sí" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mensajes_contacto_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    addToast("Exportación completada", "success");
  };

  // Calcular estadísticas
  const totalMensajes = mensajes.length;
  const noLeidos = mensajes.filter((m) => !m.leido).length;

  if (loading && mensajes.length === 0) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarMensajes} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mensajes de Contacto
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los mensajes enviados por los clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download size={16} /> Exportar CSV
          </button>
          <button
            onClick={cargarMensajes}
            className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total mensajes"
          value={totalMensajes}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="No leídos"
          value={noLeidos}
          icon={Mail}
          color="amber"
        />
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar por nombre, email o mensaje..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            Buscar
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={soloNoLeidos}
              onChange={(e) => setSoloNoLeidos(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-gray-600 dark:text-gray-300">
              Solo no leídos
            </span>
          </label>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="space-y-3">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Inbox size={32} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              No hay mensajes
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {soloNoLeidos || search
                ? "Intenta cambiar los filtros de búsqueda"
                : "Los mensajes de contacto aparecerán aquí"}
            </p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <MensajeCard
              key={mensaje.id}
              mensaje={mensaje}
              onLeer={handleMarcarLeido}
              onEliminar={setEliminandoMensaje}
              formatearFecha={formatearFecha}
            />
          ))
        )}
      </div>

      {/* Confirmar eliminación */}
      <ConfirmModal
        isOpen={!!eliminandoMensaje}
        onClose={() => setEliminandoMensaje(null)}
        onConfirm={() => handleEliminar(eliminandoMensaje)}
        title="Eliminar mensaje"
        message={`¿Estás seguro de eliminar el mensaje de "${eliminandoMensaje?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
