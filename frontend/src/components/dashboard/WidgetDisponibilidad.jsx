// frontend/src/components/dashboard/WidgetDisponibilidad.jsx
//

import React, { useState, useCallback, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  RefreshCw,
  Search,
  AlertTriangle,
  Zap,
  User,
  ChevronDown,
} from "lucide-react";
import { verificarDisponibilidad } from "../../services/citaService";
import { useConfig } from "../../context/ConfigContext";

// ── helpers ───────────────────────────────────────────────────────────────────

const HOY = new Date().toISOString().split("T")[0];

// ── sub-componentes ───────────────────────────────────────────────────────────

// Resultado de disponibilidad de un slot específico
function ResultadoSlot({ hora, disponible, checking, fecha, barberoNombre }) {
  if (checking) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
        <RefreshCw size={18} className="animate-spin text-amber-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Verificando {hora}…
        </span>
      </div>
    );
  }

  if (disponible === null) return null;

  return (
    <div
      className={`
      relative overflow-hidden rounded-2xl px-5 py-4
      flex items-center gap-4
      border-2 transition-all
      ${
        disponible
          ? "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800/50"
          : "bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/50"
      }
    `}
    >
      {/* Decoración lateral */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${disponible ? "bg-green-400" : "bg-red-400"}`}
      />

      <div
        className={`
        w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
        ${disponible ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}
      `}
      >
        {disponible ? (
          <CheckCircle2
            size={24}
            className="text-green-600 dark:text-green-400"
          />
        ) : (
          <XCircle size={24} className="text-red-600 dark:text-red-400" />
        )}
      </div>

      <div>
        <p
          className={`text-lg font-bold ${disponible ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
        >
          {hora} — {disponible ? "Disponible" : "Ocupado"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
          {barberoNombre} ·{" "}
          {fecha
            ? new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : ""}
        </p>
      </div>

      {/* Zap decorativo para disponible */}
      {disponible && (
        <Zap
          size={40}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-green-200 dark:text-green-900/40"
        />
      )}
    </div>
  );
}

// Cuadrícula de slots del día completo
function GridSlots({
  horariosOcupados,
  horaConsultada,
  fecha,
  generarSlotsHorarios,
}) {
  if (!fecha || !horariosOcupados) return null;

  // Generar slots dinámicamente desde la configuración
  const TODOS_LOS_SLOTS = generarSlotsHorarios();

  const ocupadosSet = new Set(
    (horariosOcupados || []).map((h) => String(h).slice(0, 5)),
  );
  const consultadoNorm = horaConsultada
    ? String(horaConsultada).slice(0, 5)
    : null;

  const total = TODOS_LOS_SLOTS.length;
  const ocupados = TODOS_LOS_SLOTS.filter((s) => ocupadosSet.has(s)).length;
  const libres = total - ocupados;
  const pctOcup = total > 0 ? Math.round((ocupados / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Resumen del día */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Mapa del día
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />{" "}
            {libres} libres
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />{" "}
            {ocupados} ocupados
          </span>
        </div>
      </div>

      {/* Barra de ocupación */}
      <div className="space-y-1">
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full transition-all duration-700"
            style={{ width: `${pctOcup}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right">{pctOcup}% ocupado</p>
      </div>

      {/* Grid de slots */}
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
        {TODOS_LOS_SLOTS.map((slot) => {
          const ocupado = ocupadosSet.has(slot);
          const esConsultado = slot === consultadoNorm;
          const [h, m] = slot.split(":");
          const esMediodia = slot === "12:00";

          return (
            <div
              key={slot}
              title={`${slot} — ${ocupado ? "Ocupado" : "Libre"}`}
              className={`
                relative flex flex-col items-center justify-center
                rounded-lg py-1.5 px-0.5
                text-center text-xs font-semibold
                transition-all duration-150
                ${
                  esConsultado
                    ? "ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-800 scale-110 z-10"
                    : ""
                }
                ${
                  ocupado
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                }
              `}
            >
              <span className="leading-none tabular-nums">{h}</span>
              <span className="leading-none text-[9px] opacity-70">{m}</span>
              {esMediodia && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda de horas */}
      <div className="flex justify-between text-xs text-gray-400 px-0.5">
        <span>{TODOS_LOS_SLOTS[0] || "07:00"}</span>
        <span>12:00</span>
        <span>
          {TODOS_LOS_SLOTS[Math.floor(TODOS_LOS_SLOTS.length / 2)] || "14:00"}
        </span>
        <span>{TODOS_LOS_SLOTS[TODOS_LOS_SLOTS.length - 1] || "20:30"}</span>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function WidgetDisponibilidad({
  barberoId: barberoIdProp,
  barberoNombre: barberoNombreProp,
  showBarberoSelector = false,
  barberos = [],
}) {
  // Usar el hook de configuración
  const {
    getValue,
    esDiaLaborable,
    estaEnHorarioLaboral,
    generarSlotsHorarios,
    loading: configLoading,
  } = useConfig();

  const [barberoIdLocal, setBarberoIdLocal] = useState(
    () => barberoIdProp || (barberos[0]?.id ?? null),
  );
  const [fecha, setFecha] = useState(HOY);
  const [hora, setHora] = useState("09:00");
  const [resultado, setResultado] = useState(null); // null | { disponible, horarios_ocupados }
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [consultado, setConsultado] = useState(false); // se ha ejecutado al menos una consulta

  const barberoId = showBarberoSelector
    ? barberoIdLocal
    : (barberoIdProp ?? barberoIdLocal);
  const barberoNombre = showBarberoSelector
    ? (barberos.find((b) => b.id === barberoId)?.nombre ?? "Barbero")
    : (barberoNombreProp ?? "Barbero");

  const consultar = useCallback(async () => {
    if (!barberoId || !fecha || !hora) return;
    setChecking(true);
    setError(null);
    setResultado(null);
    try {
      const r = await verificarDisponibilidad(barberoId, fecha, hora);
      setResultado({
        disponible: r.disponible,
        horariosOcupados: r.horarios_ocupados || [],
      });
      setConsultado(true);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Error al verificar");
    } finally {
      setChecking(false);
    }
  }, [barberoId, fecha, hora]);

  const limpiar = () => {
    setResultado(null);
    setConsultado(false);
    setError(null);
  };

  // Validar fecha al cambiar
  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);

    // Validar si es día laborable usando la configuración
    if (nuevaFecha && !esDiaLaborable(nuevaFecha)) {
      const diasLaborales = getValue("dias_laborales", []);
      setError(
        `El negocio no labora en esta fecha. Días laborales: ${diasLaborales.join(", ")}`,
      );
    } else {
      setError(null);
    }
    limpiar();
  };

  // Validar hora al cambiar
  const handleHoraChange = (e) => {
    const nuevaHora = e.target.value;
    setHora(nuevaHora);

    if (nuevaHora && !estaEnHorarioLaboral(nuevaHora)) {
      const apertura = getValue("horario_apertura", "09:00");
      const cierre = getValue("horario_cierre", "20:00");
      setError(
        `Horario no disponible. El negocio está abierto de ${apertura} a ${cierre}`,
      );
    } else {
      setError(null);
    }
    limpiar();
  };

  // Mostrar loading mientras carga la configuración
  if (configLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-5 py-8 flex items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-amber-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
      {/* ── Cabecera ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Zap size={15} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
              Verificar disponibilidad
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Consulta puntual de un slot específico
            </p>
          </div>
        </div>
        {consultado && (
          <button
            onClick={limpiar}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Selector de barbero (solo admin) ─────────────────────────── */}
        {showBarberoSelector && barberos.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Barbero
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={barberoId ?? ""}
                onChange={(e) => {
                  setBarberoIdLocal(Number(e.target.value));
                  limpiar();
                }}
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition appearance-none"
              >
                {barberos.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* ── Formulario de consulta ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Fecha
            </label>
            <div className="relative">
              <Calendar
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={fecha}
                min={HOY}
                onChange={handleFechaChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Hora */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Hora
            </label>
            <div className="relative">
              <Clock
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="time"
                value={hora}
                step="1800"
                onChange={handleHoraChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Botón verificar */}
          <div className="flex flex-col justify-end">
            <button
              onClick={consultar}
              disabled={checking || !barberoId || !fecha || !hora}
              className="
                flex items-center justify-center gap-2
                bg-gray-900 dark:bg-amber-400
                hover:bg-gray-700 dark:hover:bg-amber-300
                active:scale-[0.98]
                text-white dark:text-gray-900
                font-bold text-sm
                py-2.5 px-4 rounded-xl
                transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-sm
              "
            >
              {checking ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Verificando…
                </>
              ) : (
                <>
                  <Search size={14} /> Verificar
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Resultado del slot consultado ─────────────────────────────── */}
        {(checking || resultado !== null) && (
          <div className="space-y-1">
            <ResultadoSlot
              hora={hora}
              disponible={resultado?.disponible ?? null}
              checking={checking}
              fecha={fecha}
              barberoNombre={barberoNombre}
            />
          </div>
        )}

        {/* ── Mapa de slots del día ─────────────────────────────────────── */}
        {!checking &&
          resultado !== null &&
          resultado.horariosOcupados !== undefined && (
            <div className="border-t border-gray-100 dark:border-white/5 pt-5">
              <GridSlots
                horariosOcupados={resultado.horariosOcupados}
                horaConsultada={hora}
                fecha={fecha}
                generarSlotsHorarios={generarSlotsHorarios}
              />
            </div>
          )}

        {/* ── Estado inicial (sin consultar) ────────────────────────────── */}
        {!consultado && !checking && !error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Selecciona una fecha y hora, luego presiona{" "}
              <strong className="text-gray-700 dark:text-gray-300">
                Verificar
              </strong>{" "}
              para comprobar si el slot está libre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
