// frontend/src/components/dashboard/VistaAgendaSemanal.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
  BadgeCheck,
} from "lucide-react";
import { getAgendaSemana } from "../../services/citaService";
import DrawerDetalleCita from "./DrawerDetalleCita";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";

const lunesDe = (fecha) => {
  const d = new Date(fecha + "T12:00:00");
  const dia = d.getDay();
  d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia));
  return d.toISOString().split("T")[0];
};

const addDias = (s, n) => {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

const HOY = new Date().toISOString().split("T")[0];
const DIAS_CORTO = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DIAS_LARGO = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const fmtRango = (ini, fin) => {
  if (!ini || !fin) return "";
  const dI = new Date(ini + "T12:00:00");
  const dF = new Date(fin + "T12:00:00");
  if (dI.getMonth() === dF.getMonth())
    return `${dI.getDate()} – ${dF.getDate()} de ${MESES[dI.getMonth()]} ${dI.getFullYear()}`;
  return `${dI.getDate()} ${MESES[dI.getMonth()]} – ${dF.getDate()} ${MESES[dF.getMonth()]} ${dF.getFullYear()}`;
};

const fmtHora = (raw) => String(raw || "").slice(0, 5);
const pct = (n) => Math.min(100, Math.round((n / 14) * 100));
const idxLocal = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);

const ESTADO_CFG = {
  pendiente: {
    dot: "bg-amber-400",
    pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    Icon: Hourglass,
  },
  confirmada: {
    dot: "bg-blue-500",
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Icon: BadgeCheck,
  },
  completada: {
    dot: "bg-green-500",
    pill: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    Icon: CheckCircle2,
  },
  cancelada: {
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-gray-500 dark:bg-gray-700/60 dark:text-gray-400",
    Icon: XCircle,
  },
};

function CitaPill({ cita, onClick }) {
  const cfg = ESTADO_CFG[cita.estado] || ESTADO_CFG.cancelada;
  const Icon = cfg.Icon;
  return (
    <button
      onClick={() => onClick(cita.id)}
      className="w-full text-left flex items-start gap-1.5 px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/15 border border-transparent hover:border-amber-200 dark:hover:border-amber-800/40 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">
            {fmtHora(cita.hora)}
          </span>
          <Icon size={10} className="flex-shrink-0 text-gray-400" />
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 truncate leading-tight">
          {cita.cliente_nombre}
        </p>
        <p className="text-xs text-gray-400 truncate leading-tight">
          {cita.servicio_nombre}
        </p>
      </div>
    </button>
  );
}

function ColumnaDia({ fecha, citas, onClickCita }) {
  const d = new Date(fecha + "T12:00:00");
  const jsDia = d.getDay();
  const idx = idxLocal(jsDia);
  const esHoy = fecha === HOY;
  const esFinde = jsDia === 0 || jsDia === 6;
  const ocupacion = pct(citas.length);

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden border transition-shadow ${esHoy ? "border-amber-300 dark:border-amber-600 ring-2 ring-amber-100 dark:ring-amber-900/40 shadow-md" : "border-gray-100 dark:border-white/5 shadow-sm"} ${esFinde && !esHoy ? "bg-gray-50/70 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"}`}
    >
      <div
        className={`px-2.5 py-2 border-b flex flex-col gap-0.5 ${esHoy ? "bg-amber-400 border-amber-300" : "bg-gray-50 dark:bg-gray-700/40 border-gray-100 dark:border-white/5"}`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${esHoy ? "text-gray-900/70" : "text-gray-400 dark:text-gray-500"}`}
        >
          {DIAS_CORTO[idx]}
        </span>
        <span
          className={`text-xl font-bold leading-none ${esHoy ? "text-gray-900" : "text-gray-800 dark:text-white"}`}
        >
          {d.getDate()}
        </span>
        {citas.length > 0 ? (
          <span
            className={`text-xs font-bold self-start px-1.5 py-0.5 rounded-full leading-none ${esHoy ? "bg-gray-900/15 text-gray-900" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}
          >
            {citas.length}
          </span>
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-600 leading-none">
            libre
          </span>
        )}
      </div>
      <div className="h-0.5 bg-gray-100 dark:bg-gray-700/40">
        <div
          className={`h-full transition-all duration-700 ${esHoy ? "bg-amber-500" : "bg-amber-300 dark:bg-amber-700/60"}`}
          style={{ width: `${ocupacion}%` }}
        />
      </div>
      <div
        className="flex-1 p-1.5 space-y-1 overflow-y-auto"
        style={{ minHeight: 100 }}
      >
        {citas.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-300 dark:text-gray-600">—</p>
          </div>
        ) : (
          citas.map((c) => (
            <CitaPill key={c.id} cita={c} onClick={onClickCita} />
          ))
        )}
      </div>
    </div>
  );
}

function ResumenSemana({ agenda }) {
  const todas = Object.values(agenda).flat();
  const cnt = todas.reduce((a, c) => {
    a[c.estado] = (a[c.estado] || 0) + 1;
    return a;
  }, {});
  const items = [
    { label: "Total", val: todas.length, cls: "text-gray-900 dark:text-white" },
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
      label: "Canceladas",
      val: cnt.cancelada || 0,
      cls: "text-gray-400 dark:text-gray-500",
    },
  ];
  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className={`text-2xl font-bold ${s.cls}`}>{s.val}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function VistaAgendaSemanal({ barberoId }) {
  const [semanaInicio, setSemanaInicio] = useState(() => lunesDe(HOY));
  const [agenda, setAgenda] = useState({});
  const [meta, setMeta] = useState({
    fecha_inicio: null,
    fecha_fin: null,
    total_citas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citaIdDetalle, setCitaIdDetalle] = useState(null);

  const cargar = useCallback(async () => {
    if (!barberoId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await getAgendaSemana(barberoId, semanaInicio);
      setAgenda(r.agenda || {});
      setMeta({
        fecha_inicio: r.fecha_inicio || semanaInicio,
        fecha_fin: r.fecha_fin || addDias(semanaInicio, 6),
        total_citas: r.total_citas || 0,
      });
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Error al cargar agenda",
      );
    } finally {
      setLoading(false);
    }
  }, [barberoId, semanaInicio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDias(semanaInicio, i)),
    [semanaInicio],
  );
  const esSemanaActual = semanaInicio === lunesDe(HOY);

  const handleAccionDrawer = (citaActualizada) => {
    if (!citaActualizada) return;
    setAgenda((prev) => {
      const next = {};
      for (const [f, lista] of Object.entries(prev)) {
        next[f] = lista.map((c) =>
          c.id === citaActualizada.id
            ? { ...c, estado: citaActualizada.estado }
            : c,
        );
      }
      return next;
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => setSemanaInicio((s) => addDias(s, -7))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-amber-500 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDays
                size={15}
                className="text-amber-500 flex-shrink-0"
              />
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate capitalize">
                {fmtRango(meta.fecha_inicio, meta.fecha_fin)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {esSemanaActual ? (
                <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-2.5 py-0.5">
                  Esta semana
                </span>
              ) : (
                <button
                  onClick={() => setSemanaInicio(lunesDe(HOY))}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  Hoy
                </button>
              )}
              {!loading && (
                <span className="text-xs text-gray-400">
                  {meta.total_citas} citas
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={cargar}
              aria-label="Recargar"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-amber-500 transition-all"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin text-amber-400" : ""}
              />
            </button>
            <button
              onClick={() => setSemanaInicio((s) => addDias(s, 7))}
              aria-label="Semana siguiente"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-amber-500 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {!loading && !error && <ResumenSemana agenda={agenda} />}
        {loading && <Spinner />}
        {!loading && error && <ErrorBanner message={error} onRetry={cargar} />}

        {!loading && !error && (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {dias.map((fecha) => {
                const citasDia = agenda[fecha] || [];
                const d = new Date(fecha + "T12:00:00");
                const jsDia = d.getDay();
                const idx = idxLocal(jsDia);
                const esHoy = fecha === HOY;
                const esFinde = jsDia === 0 || jsDia === 6;
                return (
                  <div
                    key={fecha}
                    className={`rounded-2xl border overflow-hidden ${esHoy ? "border-amber-300 dark:border-amber-600 ring-2 ring-amber-100 dark:ring-amber-900/30" : "border-gray-100 dark:border-white/5"} ${esFinde && !esHoy ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"}`}
                  >
                    <div
                      className={`flex items-center justify-between px-4 py-3 border-b ${esHoy ? "bg-amber-400 border-amber-300" : "bg-gray-50 dark:bg-gray-700/40 border-gray-100 dark:border-white/5"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${esHoy ? "text-gray-900" : "text-gray-800 dark:text-white"}`}
                        >
                          {DIAS_LARGO[idx]}
                        </span>
                        <span
                          className={`text-sm ${esHoy ? "text-gray-900/60" : "text-gray-400"}`}
                        >
                          {d.getDate()} {MESES[d.getMonth()]}
                        </span>
                        {esHoy && (
                          <span className="text-xs bg-gray-900/20 text-gray-900 font-bold px-1.5 py-0.5 rounded-full">
                            Hoy
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${citasDia.length > 0 ? (esHoy ? "bg-gray-900/15 text-gray-900" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400") : "text-gray-300 dark:text-gray-600"}`}
                      >
                        {citasDia.length > 0
                          ? `${citasDia.length} cita${citasDia.length > 1 ? "s" : ""}`
                          : "libre"}
                      </span>
                    </div>
                    {citasDia.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {citasDia.map((c) => {
                          const cfg =
                            ESTADO_CFG[c.estado] || ESTADO_CFG.cancelada;
                          const Icon = cfg.Icon;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setCitaIdDetalle(c.id)}
                              className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                            >
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold tabular-nums text-gray-900 dark:text-white">
                                    {fmtHora(c.hora)}
                                  </span>
                                  <Icon size={11} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {c.cliente_nombre}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {c.servicio_nombre} · {c.duracion} min
                                </p>
                              </div>
                              <ChevronRight
                                size={14}
                                className="text-gray-300 dark:text-gray-600 flex-shrink-0"
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-4 flex items-center gap-2 text-gray-300 dark:text-gray-600">
                        <Calendar size={13} />
                        <span className="text-xs">Sin citas</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="hidden md:grid grid-cols-7 gap-2"
              style={{ minHeight: 340 }}
            >
              {dias.map((fecha) => (
                <ColumnaDia
                  key={fecha}
                  fecha={fecha}
                  citas={agenda[fecha] || []}
                  onClickCita={setCitaIdDetalle}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 pt-1">
              {Object.entries(ESTADO_CFG).map(([estado, cfg]) => (
                <div key={estado} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs text-gray-400 capitalize">
                    {estado}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <DrawerDetalleCita
        citaId={citaIdDetalle}
        onClose={() => setCitaIdDetalle(null)}
        rol="barbero"
        onAccion={handleAccionDrawer}
      />
    </>
  );
}
