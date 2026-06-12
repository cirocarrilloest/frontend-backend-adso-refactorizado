// frontend/src/components/admin/VistaTodasLasCitas.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  X,
} from "lucide-react";
import { getAllCitas } from "../../services/citaService";
import DrawerDetalleCita from "../dashboard/DrawerDetalleCita";
import { useToast } from "../../context/ToastContext";

const fmtFecha = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fmtHora = (raw) => String(raw || "").slice(0, 5);

const fmtPrecio = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const ESTADO_COLORS = {
  pendiente:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmada:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completada:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelada: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const ESTADO_LABELS = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const ESTADOS_FILTRO = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function VistaTodasLasCitas() {
  const { addToast } = useToast();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCitas, setTotalCitas] = useState(0);
  const [citaSeleccionadaId, setCitaSeleccionadaId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const itemsPorPagina = 15;

  const cargarCitas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pagina, limit: itemsPorPagina };
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroFechaInicio) params.fecha_desde = filtroFechaInicio;
      if (filtroFechaFin) params.fecha_hasta = filtroFechaFin;

      const response = await getAllCitas(params);
      setCitas(response.citas || []);
      setTotalPaginas(
        response.totalPages ||
          Math.ceil((response.total || 0) / itemsPorPagina) ||
          1,
      );
      setTotalCitas(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar las citas");
      addToast(
        err.response?.data?.message || "Error al cargar las citas",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [
    pagina,
    filtroEstado,
    filtroFechaInicio,
    filtroFechaFin,
    itemsPorPagina,
    addToast,
  ]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  useEffect(() => {
    setPagina(1);
  }, [filtroEstado, filtroFechaInicio, filtroFechaFin]);

  const handleLimpiarFiltros = () => {
    setFiltroEstado("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    setShowFilters(false);
  };

  const handleVerDetalle = (citaId) => {
    setCitaSeleccionadaId(citaId);
    setDrawerOpen(true);
  };

  const handleCerrarDrawer = () => {
    setDrawerOpen(false);
    setCitaSeleccionadaId(null);
  };

  const handleCitaActualizada = () => {
    cargarCitas();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestión de Citas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Todas las citas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters || filtroEstado || filtroFechaInicio || filtroFechaFin
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Filter size={16} /> Filtros
            {(filtroEstado || filtroFechaInicio || filtroFechaFin) && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={cargarCitas}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Actualizar
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filtros
            </h3>
            <button
              onClick={handleLimpiarFiltros}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <X size={12} /> Limpiar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
              >
                {ESTADOS_FILTRO.map((est) => (
                  <option key={est.value} value={est.value}>
                    {est.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={28} className="animate-spin text-amber-400" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={cargarCitas}
              className="text-amber-500 text-sm hover:text-amber-600"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Barbero
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {citas.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-12 text-center text-gray-400"
                      >
                        No hay citas que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    citas.map((cita) => (
                      <tr
                        key={cita.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          #{cita.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {fmtFecha(cita.fecha)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {fmtHora(cita.hora)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {cita.cliente_nombre || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {cita.barbero_nombre || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {cita.servicio_nombre || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {fmtPrecio(cita.precio)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[cita.estado]}`}
                          >
                            {ESTADO_LABELS[cita.estado] || cita.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleVerDetalle(cita.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total: {totalCitas} cita{totalCitas !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {pagina} / {totalPaginas}
                  </span>
                  <button
                    onClick={() =>
                      setPagina((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={pagina === totalPaginas}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DrawerDetalleCita
        citaId={citaSeleccionadaId}
        onClose={handleCerrarDrawer}
        rol="admin"
        onAccion={handleCitaActualizada}
      />
    </div>
  );
}
