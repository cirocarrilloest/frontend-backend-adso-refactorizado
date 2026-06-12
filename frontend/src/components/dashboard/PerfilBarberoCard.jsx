// frontend/src/components/dashboard/PerfilBarberoCard.jsx
import React, { useState, useEffect } from "react";
import {
  Scissors,
  Star,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { getPerfilBarbero } from "../../services/usuarioService";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";

const fmtPrecio = (n) =>
  Number(n).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
const tasaExito = (completadas, total) =>
  total && total > 0
    ? Math.round((Number(completadas) / Number(total)) * 100)
    : 0;

function Stat({ label, value, sub, accent }) {
  return (
    <div
      className={`rounded-xl px-3 py-3 text-center ${accent ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40" : "bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-white/5"}`}
    >
      <p
        className={`text-xl font-bold leading-none ${accent ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
        {label}
      </p>
      {sub !== undefined && (
        <p
          className={`text-xs font-semibold mt-0.5 ${accent ? "text-amber-500" : "text-gray-400"}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function ServicioRow({ servicio, index }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {servicio.nombre}
        </p>
        <p className="text-xs text-gray-400">{servicio.duracion} min</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {fmtPrecio(servicio.precio)}
        </p>
        <p className="text-xs text-gray-400">
          {servicio.veces_realizado}× realizado
        </p>
      </div>
    </div>
  );
}

export default function PerfilBarberoCard({
  barberoId,
  onReservar,
  soloLectura = false,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    if (!barberoId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPerfilBarbero(barberoId);
      setData(res.barbero);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "No se pudo cargar el perfil",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [barberoId]);

  if (!barberoId) return null;
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargar} />;

  const { nombre, email, telefono, estadisticas, servicios_frecuentes } = data;
  const exito = tasaExito(
    estadisticas?.citas_completadas,
    estadisticas?.total_citas,
  );
  const inicial = nombre?.charAt(0)?.toUpperCase() || "B";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 pt-6 pb-8">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <span className="text-2xl font-bold text-gray-900">
                {inicial}
              </span>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow">
              <Scissors size={11} className="text-gray-900" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-tight truncate">
              {nombre}
            </h2>
            <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mt-0.5">
              Barbero profesional
            </p>
            <div className="flex flex-col gap-0.5 mt-2">
              {email && (
                <div className="flex items-center gap-1.5 text-white/50">
                  <Mail size={11} />
                  <span className="text-xs truncate">{email}</span>
                </div>
              )}
              {telefono && (
                <div className="flex items-center gap-1.5 text-white/50">
                  <Phone size={11} />
                  <span className="text-xs">{telefono}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Star size={10} className="text-amber-400" /> Tasa de éxito
            </span>
            <span className="text-xs font-bold text-amber-400">{exito}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${exito}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <BarChart3 size={12} /> Estadísticas
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          <Stat
            label="Total citas"
            value={estadisticas?.total_citas ?? "—"}
            accent
          />
          <Stat
            label="Completadas"
            value={estadisticas?.citas_completadas ?? "—"}
            sub={
              <span className="flex items-center justify-center gap-0.5 text-green-500">
                <CheckCircle2 size={10} /> ok
              </span>
            }
          />
          <Stat
            label="Canceladas"
            value={estadisticas?.citas_canceladas ?? "—"}
            sub={
              <span className="flex items-center justify-center gap-0.5 text-red-400">
                <XCircle size={10} /> baja
              </span>
            }
          />
        </div>
      </div>

      {servicios_frecuentes?.length > 0 && (
        <div className="px-5 pb-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Clock size={12} /> Servicios frecuentes
          </p>
          <div>
            {servicios_frecuentes.map((s, i) => (
              <ServicioRow key={s.id} servicio={s} index={i} />
            ))}
          </div>
        </div>
      )}

      {!soloLectura && onReservar && (
        <div className="px-5 pb-5">
          <button
            onClick={onReservar}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-gray-900 font-bold text-sm py-3 rounded-xl transition-colors duration-150 shadow-sm shadow-amber-200 dark:shadow-amber-900/20"
          >
            Reservar con {nombre?.split(" ")[0]} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
