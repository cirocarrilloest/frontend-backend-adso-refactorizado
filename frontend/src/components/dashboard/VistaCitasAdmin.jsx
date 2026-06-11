// frontend/src/components/dashboard/VistaCitasAdmin.jsx
//

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  RefreshCw,
  AlertCircle,
  Search,
  X,
  Calendar,
  Clock,
  Scissors,
  User,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Hourglass,
  BadgeCheck,
  Filter,
  BarChart3,
  Zap,
} from "lucide-react";
import { getCitasBarbero } from "../../services/citaService";
import { getUsuarios } from "../../services/usuarioService";
import DrawerDetalleCita from "./DrawerDetalleCita";
import WidgetDisponibilidad from "./WidgetDisponibilidad";
import { useConfig } from "../../context/ConfigContext";

// helpers

const ESTADOS = ["todos", "pendiente", "confirmada", "completada", "cancelada"];

const ESTADO_CFG = {
  pendiente: {
    label: "Pendiente",
    dot: "bg-amber-400",
    pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Icon: Hourglass,
  },
  confirmada: {
    label: "Confirmada",
    dot: "bg-blue-500",
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Icon: BadgeCheck,
  },
  completada: {
    label: "Completada",
    dot: "bg-green-500",
    pill: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400",
    Icon: XCircle,
  },
};

const fmtFecha = (raw) => {
  if (!raw) return "—";
  const d = new Date(String(raw).includes("T") ? raw : `${raw}T12:00:00`);
  return d.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtHora = (raw) => String(raw || "").slice(0, 5);

// Columnas para ordenamiento
const COLS = [
  { key: "fecha", label: "Fecha" },
  { key: "hora", label: "Hora" },
  { key: "cliente_nombre", label: "Cliente" },
  { key: "servicio_nombre", label: "Servicio" },
  { key: "precio", label: "Precio" },
  { key: "estado", label: "Estado" },
];

// sub-componentes

function Spinner({ msg = "Cargando…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <RefreshCw size={22} className="animate-spin text-amber-400" />
      <p className="text-xs text-gray-400">{msg}</p>
    </div>
  );
}

function EmptyState({ sinBarbero }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
        {sinBarbero ? (
          <User size={28} className="text-gray-400" />
        ) : (
          <Calendar size={28} className="text-gray-400" />
        )}
      </div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">
        {sinBarbero ? "Selecciona un barbero" : "Sin citas para este filtro"}
      </p>
      <p className="text-xs text-gray-400 max-w-xs">
        {sinBarbero
          ? "Elige un barbero del selector para ver sus citas."
          : "Intenta cambiar el filtro de estado o la fecha."}
      </p>
    </div>
  );
}

function EstadoChip({ estado, activo, count, onClick }) {
  const cfg = estado ? ESTADO_CFG[estado] : null;
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        border transition-all whitespace-nowrap
        ${
          activo
            ? "bg-amber-400 border-amber-400 text-gray-900 shadow-sm"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-amber-300"
        }
      `}
    >
      {cfg ? (
        <>
          <span
            className={`w-2 h-2 rounded-full ${activo ? "bg-gray-900" : cfg.dot}`}
          />
          {cfg.label}
        </>
      ) : (
        "Todos"
      )}
      {count !== undefined && (
        <span
          className={`ml-0.5 ${activo ? "text-gray-900/60" : "text-gray-400"}`}
        >
          ({count})
        </span>
      )}
    </button>
  );
}

// Tarjeta de mini-estadísticas del barbero seleccionado
function StatsBar({ citas, formatearPrecio }) {
  const cnt = citas.reduce((a, c) => {
    a[c.estado] = (a[c.estado] || 0) + 1;
    return a;
  }, {});
  const ingresos = citas
    .filter((c) => c.estado === "completada")
    .reduce((s, c) => s + Number(c.precio || 0), 0);

  const items = [
    { label: "Total", val: citas.length, cls: "text-gray-900 dark:text-white" },
    {
      label: "Pendientes",
      val: cnt.pendiente || 0,
      cls: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Confirmadas",
      val: cnt.confirmada || 0,
      cls: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Completadas",
      val: cnt.completada || 0,
      cls: "text-green-600 dark:text-green-400",
    },
    {
      label: "Ingresos",
      val: formatearPrecio(ingresos),
      cls: "text-green-700 dark:text-green-300",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className={`text-lg font-bold leading-tight ${s.cls}`}>{s.val}</p>
          <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// Cabecera de columna ordenable
function ColHeader({ col, ordenCol, ordenDir, onClick }) {
  const activo = ordenCol === col.key;
  return (
    <th
      onClick={() => onClick(col.key)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-amber-500 transition-colors whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        {col.label}
        {activo ? (
          ordenDir === "asc" ? (
            <ChevronUp size={12} className="text-amber-500" />
          ) : (
            <ChevronDown size={12} className="text-amber-500" />
          )
        ) : (
          <ChevronDown size={12} className="text-gray-300 dark:text-gray-600" />
        )}
      </div>
    </th>
  );
}

// Fila de cita en la tabla
function FilaCita({ cita, onClick, formatearPrecio }) {
  const cfg = ESTADO_CFG[cita.estado] || ESTADO_CFG.cancelada;
  const Icon = cfg.Icon;

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onClick(cita.id)}
      onKeyDown={(e) => e.key === "Enter" && onClick(cita.id)}
      className="group border-b border-gray-100 dark:border-white/5 last:border-0 cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-900/5 transition-colors outline-none focus-visible:bg-amber-50 dark:focus-visible:bg-amber-900/10"
    >
      {/* Fecha */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
            {fmtFecha(cita.fecha)}
          </span>
        </div>
      </td>
      {/* Hora */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm font-mono text-gray-900 dark:text-white">
            {fmtHora(cita.hora)}
          </span>
        </div>
      </td>
      {/* Cliente */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
            {cita.cliente_nombre?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
              {cita.cliente_nombre}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[140px]">
              {cita.cliente_email}
            </p>
          </div>
        </div>
      </td>
      {/* Servicio */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Scissors size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
            {cita.servicio_nombre}
          </span>
        </div>
        <p className="text-xs text-gray-400 pl-4 mt-0.5">{cita.duracion} min</p>
      </td>
      {/* Precio */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {formatearPrecio(cita.precio)}
        </span>
      </td>
      {/* Estado */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.pill}`}
          >
            <Icon size={10} />
            {cfg.label}
          </span>
        </div>
      </td>
      {/* Flecha */}
      <td className="px-3 py-3.5">
        <ChevronRight
          size={14}
          className="text-gray-300 dark:text-gray-600 group-hover:text-amber-400 transition-colors"
        />
      </td>
    </tr>
  );
}

// Componente principal
export default function VistaCitasAdmin() {
  // Usar el hook de configuración
  const {
    formatearPrecio,
    estaEnHorarioLaboral,
    esDiaLaborable,
    loading: configLoading,
  } = useConfig();

  // Barberos
  const [barberos, setBarberos] = useState([]);
  const [cargandoBarberos, setCargandoBarberos] = useState(true);

  // Selección
  const [barberoId, setBarberoId] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Estado para mostrar/ocultar el widget de disponibilidad
  const [mostrarDisponibilidad, setMostrarDisponibilidad] = useState(false);

  // Datos
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ordenamiento
  const [ordenCol, setOrdenCol] = useState("fecha");
  const [ordenDir, setOrdenDir] = useState("desc");

  // Drawer
  const [citaIdDetalle, setCitaIdDetalle] = useState(null);

  // cargar barberos al montar
  useEffect(() => {
    (async () => {
      try {
        const r = await getUsuarios({ rol: "barbero" });
        const lista = r.usuarios || [];
        setBarberos(lista);
        if (lista.length > 0) setBarberoId(lista[0].id);
      } catch (e) {
        console.error("Error cargando barberos:", e);
      } finally {
        setCargandoBarberos(false);
      }
    })();
  }, []);

  // cargar citas cuando cambia barbero o fecha
  const cargar = useCallback(async () => {
    if (!barberoId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await getCitasBarbero(barberoId, fechaFiltro || null);
      setCitas(r.citas || []);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Error al cargar citas",
      );
    } finally {
      setLoading(false);
    }
  }, [barberoId, fechaFiltro]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ordenar columna
  const toggleOrden = (col) => {
    if (ordenCol === col) setOrdenDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setOrdenCol(col);
      setOrdenDir("asc");
    }
  };

  // filtrar + ordenar
  const citasProcesadas = useMemo(() => {
    let lista = [...citas];

    // Estado
    if (filtroEstado !== "todos")
      lista = lista.filter((c) => c.estado === filtroEstado);

    // Búsqueda libre
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.cliente_nombre?.toLowerCase().includes(q) ||
          c.cliente_email?.toLowerCase().includes(q) ||
          c.servicio_nombre?.toLowerCase().includes(q),
      );
    }

    // Ordenar
    lista.sort((a, b) => {
      let va = a[ordenCol] ?? "";
      let vb = b[ordenCol] ?? "";
      if (ordenCol === "precio") {
        va = Number(va);
        vb = Number(vb);
      } else {
        va = String(va);
        vb = String(vb);
      }
      if (va < vb) return ordenDir === "asc" ? -1 : 1;
      if (va > vb) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });

    return lista;
  }, [citas, filtroEstado, busqueda, ordenCol, ordenDir]);

  // Conteo por estado (sobre datos sin filtrar)
  const conteo = useMemo(() => {
    const acc = { todos: citas.length };
    citas.forEach((c) => {
      acc[c.estado] = (acc[c.estado] || 0) + 1;
    });
    return acc;
  }, [citas]);

  // Barbero seleccionado
  const barberoActual = barberos.find((b) => b.id === barberoId);

  // Sincronizar cambio desde drawer
  const handleAccionDetalle = (citaActualizada) => {
    if (!citaActualizada) return;
    setCitas((prev) =>
      prev.map((c) =>
        c.id === citaActualizada.id
          ? { ...c, estado: citaActualizada.estado }
          : c,
      ),
    );
  };

  // Calcular ingresos totales filtrados
  const ingresosFiltrados = useMemo(() => {
    return citasProcesadas
      .filter((c) => c.estado === "completada")
      .reduce((s, c) => s + Number(c.precio || 0), 0);
  }, [citasProcesadas]);

  // Mostrar loading mientras carga la configuración
  if (configLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-5 py-16 flex items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-amber-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Selector de barbero + filtro de fecha */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            {/* Selector barbero */}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Barbero
              </label>
              {cargandoBarberos ? (
                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {barberos.map((b) => {
                    const activo = b.id === barberoId;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setBarberoId(b.id);
                          setFiltroEstado("todos");
                          setBusqueda("");
                        }}
                        className={`
                          flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                          ${
                            activo
                              ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900 shadow-sm"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30"
                          }
                        `}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${activo ? "bg-amber-400 text-gray-900" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                        >
                          {b.nombre?.charAt(0)?.toUpperCase()}
                        </div>
                        <span>{b.nombre?.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filtro de fecha */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Filtrar por fecha
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fechaFiltro}
                  onChange={(e) => setFechaFiltro(e.target.value)}
                  className="border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
                {fechaFiltro && (
                  <button
                    onClick={() => setFechaFiltro("")}
                    title="Quitar filtro de fecha"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-white/10 transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Recargar */}
            <button
              onClick={cargar}
              disabled={!barberoId || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-200 dark:border-white/10 transition-all disabled:opacity-40 flex-shrink-0"
              title="Recargar"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin text-amber-400" : ""}
              />
            </button>
          </div>

          {/* Info barbero activo */}
          {barberoActual && !cargandoBarberos && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2">
              <BarChart3 size={13} className="text-amber-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Mostrando citas de{" "}
                <strong className="text-gray-900 dark:text-white">
                  {barberoActual.nombre}
                </strong>
                {fechaFiltro && (
                  <>
                    {" "}
                    · solo el{" "}
                    <strong className="text-gray-900 dark:text-white">
                      {fmtFecha(fechaFiltro)}
                    </strong>
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Sin barbero seleccionado */}
        {!barberoId && !cargandoBarberos && <EmptyState sinBarbero />}

        {/* Loading inicial */}
        {loading && (
          <Spinner
            msg={`Cargando citas de ${barberoActual?.nombre || "barbero"}…`}
          />
        )}

        {/* Error*/}
        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido principal*/}
        {!loading && !error && barberoId && (
          <>
            {/* Mini stats + Botón toggle disponibilidad + Widget */}
            <StatsBar citas={citas} formatearPrecio={formatearPrecio} />

            {/* Toggle verificar disponibilidad */}
            <button
              onClick={() => setMostrarDisponibilidad((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400
                         hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <Zap size={13} />
              {mostrarDisponibilidad
                ? "Ocultar verificador"
                : "Verificar disponibilidad"}
            </button>

            {mostrarDisponibilidad && (
              <WidgetDisponibilidad
                showBarberoSelector={false}
                barberoId={barberoId}
                barberoNombre={barberoActual?.nombre}
              />
            )}

            {/* Filtros de estado + búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {ESTADOS.map((e) => (
                  <EstadoChip
                    key={e}
                    estado={e === "todos" ? null : e}
                    activo={filtroEstado === e}
                    count={conteo[e === "todos" ? "todos" : e]}
                    onClick={() => setFiltroEstado(e)}
                  />
                ))}
              </div>
              <div className="relative flex-shrink-0 sm:w-56">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Cliente o servicio…"
                  className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Tabla */}
            {citasProcesadas.length === 0 ? (
              <EmptyState sinBarbero={false} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                {/* Cabecera con total */}
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={13} className="text-amber-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Citas
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {citasProcesadas.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Clic en una fila para ver detalle y gestionar
                  </p>
                </div>

                {/* Tabla responsive */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/40">
                      <tr>
                        {COLS.map((col) => (
                          <ColHeader
                            key={col.key}
                            col={col}
                            ordenCol={ordenCol}
                            ordenDir={ordenDir}
                            onClick={toggleOrden}
                          />
                        ))}
                        <th className="px-3 py-3 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {citasProcesadas.map((c) => (
                        <FilaCita
                          key={c.id}
                          cita={c}
                          onClick={setCitaIdDetalle}
                          formatearPrecio={formatearPrecio}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pie con totales rápidos */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {citasProcesadas.length} de {citas.length} citas
                    {filtroEstado !== "todos" || busqueda ? " (filtradas)" : ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    Ingresos completadas:{" "}
                    <strong className="text-green-600 dark:text-green-400">
                      {formatearPrecio(ingresosFiltrados)}
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer detalle — rol admin puede confirmar/cancelar/finalizar */}
      <DrawerDetalleCita
        citaId={citaIdDetalle}
        onClose={() => setCitaIdDetalle(null)}
        rol="admin"
        onAccion={handleAccionDetalle}
      />
    </>
  );
}
