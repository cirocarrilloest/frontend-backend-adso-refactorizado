// frontend/src/components/dashboard/WidgetDisponibilidad.jsx
import React, { useState, useCallback, useEffect } from "react";
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
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { verificarDisponibilidad } from "../../services/citaService";
import { useConfig } from "../../context/ConfigContext";

const HOY = new Date().toISOString().split("T")[0];

// Generar slots desde 6:00 AM hasta 10:00 PM
const TODOS_LOS_SLOTS = (() => {
  const slots = [];
  for (let hora = 6; hora < 22; hora++) {
    slots.push(`${String(hora).padStart(2, "0")}:00`);
    slots.push(`${String(hora).padStart(2, "0")}:30`);
  }
  return slots;
})();

// ============================================================
// SUBCOMPONENTES
// ============================================================

function ResultadoSlot({ hora, disponible, checking, fecha, barberoNombre }) {
  if (checking) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl animate-pulse">
        <RefreshCw size={18} className="animate-spin text-amber-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Verificando disponibilidad para las {hora}…
        </span>
      </div>
    );
  }

  if (disponible === null) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-5 py-4 flex items-center gap-4 border-2 transition-all duration-300 ${
        disponible
          ? "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800/50"
          : "bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/50"
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${disponible ? "bg-green-400" : "bg-red-400"}`}
      />
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${disponible ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
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
          {hora} — {disponible ? "✓ Disponible" : "✗ Ocupado"}
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
      {disponible && (
        <Sparkles
          size={32}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-green-200 dark:text-green-900/40"
        />
      )}
    </div>
  );
}

function EstadisticasDia({ horariosOcupados }) {
  if (!horariosOcupados) return null;

  const total = TODOS_LOS_SLOTS.length;
  const ocupados = horariosOcupados.length;
  const libres = total - ocupados;
  const porcentajeOcupacion =
    total > 0 ? Math.round((ocupados / total) * 100) : 0;

  let mensajeOcupacion = "";
  let colorOcupacion = "";
  if (porcentajeOcupacion < 30) {
    mensajeOcupacion = "✨ Buena disponibilidad";
    colorOcupacion = "text-green-600";
  } else if (porcentajeOcupacion < 70) {
    mensajeOcupacion = "⚠️ Disponibilidad media";
    colorOcupacion = "text-amber-600";
  } else {
    mensajeOcupacion = "🔴 Día muy ocupado";
    colorOcupacion = "text-red-600";
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Resumen del día
          </span>
        </div>
        <span className={`text-xs font-bold ${colorOcupacion}`}>
          {mensajeOcupacion}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {total}
          </p>
          <p className="text-xs text-gray-400">Total slots</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-500">{ocupados}</p>
          <p className="text-xs text-gray-400">Ocupados</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-500">{libres}</p>
          <p className="text-xs text-gray-400">Libres</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${porcentajeOcupacion}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">
          {porcentajeOcupacion}% de ocupación
        </p>
      </div>
    </div>
  );
}

function GridSlots({ horariosOcupados, horaConsultada, onSelectHora }) {
  const ocupadosSet = new Set(
    (horariosOcupados || []).map((h) => String(h).slice(0, 5)),
  );
  const consultadoNorm = horaConsultada
    ? String(horaConsultada).slice(0, 5)
    : null;

  // Agrupar slots por franjas
  const slotsManana = TODOS_LOS_SLOTS.filter((s) => parseInt(s) < 12);
  const slotsTarde = TODOS_LOS_SLOTS.filter(
    (s) => parseInt(s) >= 12 && parseInt(s) < 18,
  );
  const slotsNoche = TODOS_LOS_SLOTS.filter((s) => parseInt(s) >= 18);

  const renderSlotButton = (slot) => {
    const ocupado = ocupadosSet.has(slot);
    const esConsultado = slot === consultadoNorm;

    let bgColor = "",
      textColor = "",
      tooltip = "";
    if (esConsultado) {
      bgColor =
        "bg-amber-400 ring-2 ring-amber-300 ring-offset-2 dark:ring-offset-gray-800";
      textColor = "text-gray-900";
      tooltip = "Horario consultado";
    } else if (ocupado) {
      bgColor = "bg-red-100 dark:bg-red-900/40";
      textColor = "text-red-700 dark:text-red-400";
      tooltip = "Ocupado";
    } else {
      bgColor =
        "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 cursor-pointer";
      textColor = "text-green-700 dark:text-green-400";
      tooltip = "Disponible - Clic para consultar";
    }

    return (
      <button
        key={slot}
        title={tooltip}
        onClick={() => {
          if (!ocupado && !esConsultado) {
            onSelectHora(slot);
          }
        }}
        className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 px-0.5 text-center text-xs font-semibold transition-all duration-200 ${bgColor} ${textColor} ${!ocupado && !esConsultado ? "hover:scale-105 cursor-pointer" : "opacity-80 cursor-not-allowed"}`}
      >
        <span className="leading-none tabular-nums text-sm">
          {slot.slice(0, 2)}
        </span>
        <span className="leading-none text-[10px] opacity-70">
          {slot.slice(3, 5)}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          📅 Mapa de horarios (6:00 - 22:00)
        </p>
        <p className="text-xs text-gray-400">Clic para consultar</p>
      </div>

      {slotsManana.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
            🌅 Mañana
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {slotsManana.map(renderSlotButton)}
          </div>
        </div>
      )}
      {slotsTarde.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
            ☀️ Tarde
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {slotsTarde.map(renderSlotButton)}
          </div>
        </div>
      )}
      {slotsNoche.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
            🌙 Noche
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {slotsNoche.map(renderSlotButton)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function WidgetDisponibilidad({
  barberoId: barberoIdProp,
  barberoNombre: barberoNombreProp,
  showBarberoSelector = false,
  barberos = [],
}) {
  const {
    getValue,
    esDiaLaborable,
    estaEnHorarioLaboral,
    loading: configLoading,
  } = useConfig();

  const [barberoIdLocal, setBarberoIdLocal] = useState(
    () => barberoIdProp || (barberos[0]?.id ?? null),
  );
  const [fecha, setFecha] = useState(HOY);
  const [hora, setHora] = useState("09:00");
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [disponible, setDisponible] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [consultado, setConsultado] = useState(false);

  const barberoId = showBarberoSelector
    ? barberoIdLocal
    : (barberoIdProp ?? barberoIdLocal);
  const barberoNombre = showBarberoSelector
    ? (barberos.find((b) => b.id === barberoId)?.nombre ?? "Barbero")
    : (barberoNombreProp ?? "Barbero");

  const consultar = useCallback(
    async (horaConsultar = hora) => {
      if (!barberoId || !fecha || !horaConsultar) return;

      setChecking(true);
      setError(null);

      try {
        const r = await verificarDisponibilidad(
          barberoId,
          fecha,
          horaConsultar,
        );
        setHorariosOcupados(r.horarios_ocupados || []);
        setDisponible(r.disponible);
        setConsultado(true);
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "Error al verificar",
        );
      } finally {
        setChecking(false);
      }
    },
    [barberoId, fecha, hora],
  );

  const limpiar = () => {
    setHorariosOcupados([]);
    setDisponible(null);
    setConsultado(false);
    setError(null);
  };

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
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

  const handleHoraChange = (e) => {
    const nuevaHora = e.target.value;
    setHora(nuevaHora);
    if (nuevaHora && !estaEnHorarioLaboral(nuevaHora)) {
      const apertura = getValue("horario_apertura", "06:00");
      const cierre = getValue("horario_cierre", "22:00");
      setError(
        `Horario no disponible. Horario laboral: ${apertura} a ${cierre}`,
      );
    } else {
      setError(null);
    }
    limpiar();
  };

  const handleSelectHora = (horaSeleccionada) => {
    setHora(horaSeleccionada);
    consultar(horaSeleccionada);
  };

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
      {/* Cabecera */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Zap size={15} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
              Verificador de disponibilidad
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Horario laboral: 6:00 - 22:00
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
        {/* Selector de barbero */}
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

        {/* Formulario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              📅 Fecha
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              🕐 Hora
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
          <div className="flex flex-col justify-end">
            <button
              onClick={() => consultar()}
              disabled={checking || !barberoId || !fecha || !hora}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {checking ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Verificando…
                </>
              ) : (
                <>
                  <Search size={14} /> Verificar disponibilidad
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultado */}
        {(checking || consultado) && (
          <ResultadoSlot
            hora={hora}
            disponible={disponible}
            checking={checking}
            fecha={fecha}
            barberoNombre={barberoNombre}
          />
        )}

        {/* Estadísticas y Grid */}
        {!checking && consultado && horariosOcupados.length >= 0 && (
          <>
            <EstadisticasDia horariosOcupados={horariosOcupados} />
            <GridSlots
              horariosOcupados={horariosOcupados}
              horaConsultada={hora}
              onSelectHora={handleSelectHora}
            />
          </>
        )}

        {/* Estado inicial */}
        {!consultado && !checking && !error && (
          <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center flex-shrink-0">
              <Sparkles
                size={14}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                ✨ ¿Cómo funciona?
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                1. Selecciona fecha y hora
                <br />
                2. Presiona "Verificar disponibilidad"
                <br />
                3. Si está libre, ¡puedes agendar!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
