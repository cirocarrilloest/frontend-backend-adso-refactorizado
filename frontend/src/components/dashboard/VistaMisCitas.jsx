// frontend/src/components/dashboard/VistaMisCitas.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Scissors,
  ChevronDown,
  Search,
  CheckCircle2,
  XCircle,
  Hourglass,
  BadgeCheck,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { getMisCitas, cancelarCita } from "../../services/citaService";
import ModalReagendar from "./ModalReagendar";
import DrawerDetalleCita from "./DrawerDetalleCita";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";
import { useToast } from "../../context/ToastContext";

const ESTADOS = ["todos", "pendiente", "confirmada", "completada", "cancelada"];
const ESTADO_META = {
  pendiente: {
    label: "Pendiente",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-400",
    Icon: Hourglass,
  },
  confirmada: {
    label: "Confirmada",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-400",
    Icon: BadgeCheck,
  },
  completada: {
    label: "Completada",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-400",
    Icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-gray-100 text-gray-500 dark:bg-gray-700/60 dark:text-gray-400",
    dot: "bg-gray-400",
    Icon: XCircle,
  },
};
const fmtFecha = (raw) =>
  raw
    ? new Date(
        String(raw).includes("T") ? raw : raw + "T00:00:00",
      ).toLocaleDateString("es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtPrecio = (n) =>
  Number(n).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
const mesKey = (raw) => (raw ? String(raw).split("T")[0].slice(0, 7) : "");

function EstadoChip({ estado, activo, count, onClick }) {
  const meta = ESTADO_META[estado];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${activo ? "bg-amber-400 border-amber-400 text-gray-900 shadow-sm" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-amber-300"}`}
    >
      {meta ? (
        <>
          <span
            className={`w-2 h-2 rounded-full ${activo ? "bg-gray-900" : meta.dot}`}
          />
          {meta.label}
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

function CitaRow({ cita, onVerDetalle, onCancelar, onReagendar, cancelando }) {
  const meta = ESTADO_META[cita.estado] || ESTADO_META.cancelada;
  const Icon = meta.Icon;
  const hora = String(cita.hora || "").slice(0, 5);
  const esPendiente = cita.estado === "pendiente";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onVerDetalle(cita.id)}
      onKeyDown={(e) => e.key === "Enter" && onVerDetalle(cita.id)}
      className="group relative flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] border-b border-gray-100 dark:border-white/5 last:border-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cita.estado === "completada" ? "bg-green-100 dark:bg-green-900/30" : cita.estado === "confirmada" ? "bg-blue-100 dark:bg-blue-900/20" : cita.estado === "pendiente" ? "bg-amber-100 dark:bg-amber-900/20" : "bg-gray-100 dark:bg-gray-700/40"}`}
      >
        <Icon
          size={16}
          className={
            cita.estado === "completada"
              ? "text-green-600 dark:text-green-400"
              : cita.estado === "confirmada"
                ? "text-blue-600 dark:text-blue-400"
                : cita.estado === "pendiente"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-500 dark:text-gray-400"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
            {cita.servicio_nombre}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${meta.color}`}
          >
            {meta.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Scissors size={11} /> {cita.barbero_nombre}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={11} /> {fmtFecha(cita.fecha)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={11} /> {hora}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {fmtPrecio(cita.precio)}
          </span>
          <span className="text-xs text-gray-400">{cita.duracion} min</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {esPendiente && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReagendar(cita);
              }}
              title="Reagendar"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
            >
              <CalendarClock size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelar(cita.id);
              }}
              disabled={cancelando === cita.id}
              title="Cancelar"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              {cancelando === cita.id ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <X size={13} />
              )}
            </button>
          </div>
        )}
        <ChevronRight
          size={14}
          className="text-gray-300 dark:text-gray-600 group-hover:text-amber-400 transition-colors ml-1"
        />
      </div>
    </div>
  );
}

export default function VistaMisCitas() {
  const { addToast } = useToast();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cancelando, setCancelando] = useState(null);
  const [mesesExpandidos, setMesesExpandidos] = useState({});
  const [citaReagendando, setCitaReagendando] = useState(null);
  const [citaIdDetalle, setCitaIdDetalle] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await getMisCitas();
      const lista = r.citas || [];
      setCitas(lista);
      if (lista.length > 0)
        setMesesExpandidos({ [mesKey(lista[0].fecha)]: true });
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "No se pudieron cargar las citas",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCancelar = async (id) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    setCancelando(id);
    try {
      await cancelarCita(id);
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "cancelada" } : c)),
      );
      if (citaIdDetalle === id) setCitaIdDetalle(null);
      addToast("Cita cancelada exitosamente", "success");
    } catch (e) {
      addToast(e.response?.data?.message || e.message, "error");
    } finally {
      setCancelando(null);
    }
  };

  const handleExitoReagendar = (citaActualizada) => {
    setCitas((prev) =>
      prev.map((c) =>
        c.id === citaActualizada.id
          ? { ...c, fecha: citaActualizada.fecha, hora: citaActualizada.hora }
          : c,
      ),
    );
    setCitaReagendando(null);
    addToast("Cita reagendada exitosamente", "success");
  };

  const handleAccionDetalle = (citaActualizada) => {
    if (citaActualizada)
      setCitas((prev) =>
        prev.map((c) =>
          c.id === citaActualizada.id
            ? { ...c, estado: citaActualizada.estado }
            : c,
        ),
      );
  };

  const citasFiltradas = useMemo(() => {
    let lista = citas;
    if (filtroEstado !== "todos")
      lista = lista.filter((c) => c.estado === filtroEstado);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.servicio_nombre?.toLowerCase().includes(q) ||
          c.barbero_nombre?.toLowerCase().includes(q),
      );
    }
    return lista;
  }, [citas, filtroEstado, busqueda]);

  const conteo = useMemo(() => {
    const acc = { todos: citas.length };
    citas.forEach((c) => {
      acc[c.estado] = (acc[c.estado] || 0) + 1;
    });
    return acc;
  }, [citas]);

  const grupos = useMemo(() => {
    const map = new Map();
    citasFiltradas.forEach((c) => {
      const k = mesKey(c.fecha);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(c);
    });
    return [...map.entries()];
  }, [citasFiltradas]);

  const toggleMes = (k) =>
    setMesesExpandidos((prev) => ({ ...prev, [k]: !prev[k] }));

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargar} />;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Historial completo
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {citas.length}{" "}
              {citas.length === 1 ? "cita registrada" : "citas registradas"} ·{" "}
              <span className="text-amber-500">
                Clic en una fila para ver detalle
              </span>
            </p>
          </div>
          <button
            onClick={cargar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          >
            <RefreshCw size={15} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar servicio o barbero…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {grupos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
              <Calendar size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {filtroEstado !== "todos" || !!busqueda.trim()
                ? "Sin resultados"
                : "Aún no tienes citas"}
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              {filtroEstado !== "todos" || !!busqueda.trim()
                ? "Prueba cambiando el filtro o la búsqueda."
                : "Cuando reserves tu primera cita aparecerá aquí."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {grupos.map(([k, items]) => {
              const abierto = mesesExpandidos[k] !== false;
              const [anio, mes] = k.split("-");
              const nombreMes = new Date(
                Number(anio),
                Number(mes) - 1,
                1,
              ).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
              return (
                <div
                  key={k}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => toggleMes(k)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
                        {nombreMes}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`text-gray-400 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
                    />
                  </button>
                  {abierto && (
                    <div className="border-t border-gray-100 dark:border-white/5">
                      {items.map((c) => (
                        <CitaRow
                          key={c.id}
                          cita={c}
                          onVerDetalle={setCitaIdDetalle}
                          onCancelar={handleCancelar}
                          onReagendar={setCitaReagendando}
                          cancelando={cancelando}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <DrawerDetalleCita
        citaId={citaIdDetalle}
        onClose={() => setCitaIdDetalle(null)}
        rol="cliente"
        onAccion={handleAccionDetalle}
      />
      {citaReagendando && (
        <ModalReagendar
          cita={citaReagendando}
          onClose={() => setCitaReagendando(null)}
          onExito={handleExitoReagendar}
        />
      )}
    </>
  );
}
