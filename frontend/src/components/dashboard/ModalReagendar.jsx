// frontend/src/components/dashboard/ModalReagendar.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Scissors,
  ArrowRight,
} from "lucide-react";
import {
  reagendarCita,
  getHorariosDisponibles,
} from "../../services/citaService";
import { useToast } from "../../context/ToastContext";

const HOY = new Date().toISOString().split("T")[0];

const fmtFecha = (raw) => {
  if (!raw) return "—";
  const d = new Date(String(raw).includes("T") ? raw : `${raw}T12:00:00`);
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const fmtHora = (raw) => String(raw || "").slice(0, 5);

function PasoResumen({ cita, onContinuar }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Cita actual
        </p>
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Scissors
              size={14}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0"
            />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {cita.servicio_nombre}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800/60 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {cita.barbero_nombre?.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {cita.barbero_nombre}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Calendar size={12} className="text-amber-500" />
              <span className="capitalize">{fmtFecha(cita.fecha)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Clock size={12} className="text-amber-500" />
              <span>{fmtHora(cita.hora)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-400">
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        <ArrowRight size={14} className="flex-shrink-0" />
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
        Selecciona una nueva fecha y hora para continuar. Solo se pueden
        reagendar citas en estado{" "}
        <strong className="text-amber-600 dark:text-amber-400">
          pendiente
        </strong>
        .
      </p>

      <button
        onClick={onContinuar}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-gray-900 font-bold text-sm py-3 rounded-xl transition-colors shadow-sm shadow-amber-200 dark:shadow-amber-900/20"
      >
        Elegir nueva fecha <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PasoFechaHora({
  cita,
  fecha,
  setFecha,
  hora,
  setHora,
  onVolver,
  onContinuar,
}) {
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(null);

  const cargarHorarios = useCallback(
    async (f) => {
      if (!f || !cita.barbero_id) return;
      setCargando(true);
      setErrorHorarios(null);
      setHora("");
      try {
        const r = await getHorariosDisponibles(cita.barbero_id, f);
        setHorarios(r.horarios_disponibles || []);
      } catch (e) {
        setErrorHorarios("No se pudieron cargar los horarios");
        setHorarios([]);
      } finally {
        setCargando(false);
      }
    },
    [cita.barbero_id, setHora],
  );

  useEffect(() => {
    if (fecha) cargarHorarios(fecha);
  }, [fecha, cargarHorarios]);

  const cambiarFecha = (f) => {
    setFecha(f);
    setHora("");
    setHorarios([]);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
          Nueva fecha
        </label>
        <input
          type="date"
          min={HOY}
          value={fecha}
          onChange={(e) => cambiarFecha(e.target.value)}
          className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
        />
      </div>

      {fecha && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
            Hora disponible
          </label>
          {cargando && (
            <div className="flex items-center justify-center py-6">
              <RefreshCw size={18} className="animate-spin text-amber-400" />
            </div>
          )}
          {!cargando && errorHorarios && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center py-4">
              {errorHorarios}
            </p>
          )}
          {!cargando && !errorHorarios && horarios.length === 0 && (
            <div className="text-center py-6 rounded-xl bg-gray-50 dark:bg-gray-700/30">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin horarios disponibles
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Prueba con otra fecha
              </p>
            </div>
          )}
          {!cargando && horarios.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {horarios.map((h) => (
                <button
                  key={h}
                  onClick={() => setHora(h)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    hora === h
                      ? "bg-amber-400 border-amber-400 text-gray-900 shadow-sm"
                      : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-600 bg-white dark:bg-gray-700/40"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onVolver}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={onContinuar}
          disabled={!fecha || !hora}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-gray-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
        >
          Confirmar <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function PasoConfirmar({
  cita,
  fechaNueva,
  horaNueva,
  onVolver,
  onConfirmar,
  enviando,
  error,
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Confirma el cambio
      </p>

      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3">
          <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
            Fecha actual
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 line-through">
              <Calendar size={13} />{" "}
              <span className="capitalize">{fmtFecha(cita.fecha)}</span>
            </div>
            <span className="text-gray-400">·</span>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 line-through">
              <Clock size={13} /> <span>{fmtHora(cita.hora)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-amber-400 py-1.5">
          <ArrowRight size={14} className="text-gray-900" />
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/15 px-4 py-3">
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-1.5 uppercase tracking-wider font-semibold">
            Nueva fecha
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
              <Calendar size={13} className="text-amber-500" />{" "}
              <span className="capitalize">{fmtFecha(fechaNueva)}</span>
            </div>
            <span className="text-gray-400">·</span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
              <Clock size={13} className="text-amber-500" />{" "}
              <span>{horaNueva}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Scissors size={13} className="text-amber-400 flex-shrink-0" />
        <span>{cita.servicio_nombre}</span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span>{cita.barbero_nombre}</span>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />{" "}
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onVolver}
          disabled={enviando}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          ← Cambiar
        </button>
        <button
          onClick={onConfirmar}
          disabled={enviando}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-gray-900 hover:bg-amber-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {enviando ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Guardando…
            </>
          ) : (
            <>
              <CheckCircle2 size={15} /> Reagendar
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PasoExito({ fechaNueva, horaNueva }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-green-500" />
      </div>
      <div>
        <p className="font-bold text-gray-900 dark:text-white text-lg">
          ¡Cita reagendada!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
          {fmtFecha(fechaNueva)} · {horaNueva}
        </p>
      </div>
    </div>
  );
}

export default function ModalReagendar({ cita, onClose, onExito }) {
  const [paso, setPaso] = useState(1);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const handleConfirmar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const res = await reagendarCita(cita.id, { fecha, hora });
      addToast("Cita reagendada exitosamente", "success");
      setPaso(4);
      setTimeout(() => onExito(res.cita || { ...cita, fecha, hora }), 1500);
    } catch (e) {
      setError(e.response?.data?.message || "No se pudo reagendar la cita");
      addToast(
        e.response?.data?.message || "No se pudo reagendar la cita",
        "error",
      );
      setEnviando(false);
    }
  };

  const cerrar = () => {
    if (!enviando) onClose();
  };

  const TITULOS = {
    1: "Reagendar cita",
    2: "Nueva fecha y hora",
    3: "Confirmar cambio",
    4: "¡Listo!",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/8 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`transition-all duration-300 ${paso > n ? "w-5 h-2 rounded-full bg-amber-400" : paso === n ? "w-8 h-2 rounded-full bg-amber-400" : "w-2 h-2 rounded-full bg-gray-200 dark:bg-white/15"}`}
              />
            ))}
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {TITULOS[paso]}
          </h3>
          <button
            onClick={cerrar}
            disabled={enviando}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">
          {paso === 1 && (
            <PasoResumen cita={cita} onContinuar={() => setPaso(2)} />
          )}
          {paso === 2 && (
            <PasoFechaHora
              cita={cita}
              fecha={fecha}
              setFecha={setFecha}
              hora={hora}
              setHora={setHora}
              onVolver={() => setPaso(1)}
              onContinuar={() => setPaso(3)}
            />
          )}
          {paso === 3 && (
            <PasoConfirmar
              cita={cita}
              fechaNueva={fecha}
              horaNueva={hora}
              onVolver={() => setPaso(2)}
              onConfirmar={handleConfirmar}
              enviando={enviando}
              error={error}
            />
          )}
          {paso === 4 && <PasoExito fechaNueva={fecha} horaNueva={hora} />}
        </div>
      </div>
    </div>
  );
}
