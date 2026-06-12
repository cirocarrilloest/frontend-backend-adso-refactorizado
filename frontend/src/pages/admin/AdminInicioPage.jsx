// frontend/src/pages/admin/AdminInicioPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Scissors,
  DollarSign,
  Clock,
  Award,
  Star,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useCitas } from "../../hooks/useCitas";
import { useConfig } from "../../context/ConfigContext";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

// Tarjeta de estadística principal
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
  subtitle,
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend !== undefined && trend !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp size={12} className="text-green-500" />
              ) : (
                <TrendingDown size={12} className="text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${trend > 0 ? "text-green-500" : "text-red-500"}`}
              >
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-400">
                {trendLabel || "vs mes anterior"}
              </span>
            </div>
          )}
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

// Servicio más solicitado
function ServicioTopItem({ servicio, index, formatearPrecio }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
          {index + 1}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {servicio.nombre}
        </p>
        <p className="text-xs text-gray-400">
          {servicio.total_citas} citas · {formatearPrecio(servicio.precio)}
        </p>
      </div>
      <div className="text-right">
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          {servicio.tasa_exito || 0}% éxito
        </span>
      </div>
    </div>
  );
}

// Cliente más frecuente
function ClienteTopItem({ cliente, index, formatearPrecio }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-white">
          {cliente.nombre?.charAt(0)?.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {cliente.nombre}
        </p>
        <p className="text-xs text-gray-400 truncate">{cliente.email}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {cliente.total_citas} citas
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {formatearPrecio(cliente.total_gastado)}
        </p>
      </div>
    </div>
  );
}

// Próxima cita
function CitaCercanaItem({ cita }) {
  const fecha = new Date(cita.fecha);
  const hoy = new Date();
  const esHoy = fecha.toDateString() === hoy.toDateString();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const esManana = fecha.toDateString() === manana.toDateString();

  let fechaTexto = "";
  if (esHoy) fechaTexto = "Hoy";
  else if (esManana) fechaTexto = "Mañana";
  else
    fechaTexto = fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="w-12 text-center flex-shrink-0">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {fechaTexto}
        </p>
        <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
          {cita.hora?.slice(0, 5)}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {cita.cliente_nombre}
        </p>
        <p className="text-xs text-gray-400">
          {cita.servicio_nombre} · {cita.barbero_nombre}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            cita.estado === "pendiente"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          {cita.estado === "pendiente" ? "Pendiente" : "Confirmada"}
        </span>
      </div>
    </div>
  );
}

// Gráfico de tendencia
function TendenciaChart({ data, formatearPrecio }) {
  if (!data || data.length === 0) return null;

  const maxIngreso = Math.max(...data.map((i) => i.ingresos));
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Tendencia de ingresos
          </h2>
        </div>
        <span className="text-xs text-gray-400">Últimos 6 meses</span>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-end gap-2 h-40">
          {data.map((item, idx) => {
            const altura =
              maxIngreso > 0 ? (item.ingresos / maxIngreso) * 100 : 0;
            const mesNombre = meses[parseInt(item.mes.split("-")[1]) - 1];

            return (
              <div key={idx} className="flex-1 text-center group">
                <div className="relative">
                  <div
                    className="bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-lg transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-600"
                    style={{
                      height: `${Math.max(altura, 4)}px`,
                      minHeight: altura > 0 ? "4px" : "0",
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {formatearPrecio(item.ingresos)}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{mesNombre}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminInicioPage() {
  const {
    getDashboard,
    getServiciosTop,
    getClientesTop,
    loading: citasLoading,
    error: citasError,
  } = useCitas();
  const { formatearPrecio } = useConfig();
  const [dashboard, setDashboard] = useState(null);
  const [serviciosTop, setServiciosTop] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoaded = useRef(false);

  const loadData = useCallback(async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    setLoading(true);
    setError(null);
    try {
      // Cargar todos los datos en paralelo
      const [dashResponse, serviciosResponse, clientesResponse] =
        await Promise.all([
          getDashboard(),
          getServiciosTop(5),
          getClientesTop(5),
        ]);

      setDashboard(dashResponse?.dashboard);
      setServiciosTop(serviciosResponse?.servicios || []);
      setClientesTop(clientesResponse?.clientes || []);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
      setError(
        err.response?.data?.message || err.message || "Error al cargar datos",
      );
    } finally {
      setLoading(false);
    }
  }, [getDashboard, getServiciosTop, getClientesTop]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <ErrorBanner
        message={error}
        onRetry={() => {
          hasLoaded.current = false;
          loadData();
        }}
      />
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500">No hay datos disponibles</p>
        <button
          onClick={() => loadData()}
          className="mt-4 text-amber-500 hover:text-amber-600 text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Tarjetas principales
  const stats = [
    {
      title: "Citas Hoy",
      value: dashboard.citas_hoy || 0,
      icon: Calendar,
      color: "blue",
      subtitle: `${dashboard.citas_hoy_detalle?.confirmadas || 0} confirmadas · ${dashboard.citas_hoy_detalle?.pendientes || 0} pendientes`,
    },
    {
      title: "Citas Pendientes",
      value: dashboard.citas_pendientes || 0,
      icon: Clock,
      color: "amber",
    },
    {
      title: "Ingresos del Mes",
      value: formatearPrecio(dashboard.ingresos_mes || 0),
      icon: DollarSign,
      color: "green",
      trend: dashboard.cambio_ingresos || 0,
      trendLabel: "vs mes anterior",
    },
    {
      title: "Clientes Totales",
      value: dashboard.clientes_totales || 0,
      icon: Users,
      color: "purple",
    },
    {
      title: "Barberos Activos",
      value: dashboard.barberos_activos || 0,
      icon: Scissors,
      color: "indigo",
    },
    {
      title: "Tasa Ocupación",
      value: `${dashboard.tasa_ocupacion || 0}%`,
      icon: Activity,
      color: "rose",
      subtitle: "Promedio del mes",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resumen general del negocio
          </p>
        </div>
        <button
          onClick={() => {
            hasLoaded.current = false;
            loadData();
          }}
          className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Sección de gráficos y listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios más solicitados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Servicios más solicitados
              </h2>
            </div>
            <span className="text-xs text-gray-400">Histórico</span>
          </div>
          <div className="px-5">
            {serviciosTop.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <Scissors size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin datos de servicios</p>
              </div>
            ) : (
              serviciosTop.map((servicio, idx) => (
                <ServicioTopItem
                  key={servicio.id}
                  servicio={servicio}
                  index={idx}
                  formatearPrecio={formatearPrecio}
                />
              ))
            )}
          </div>
        </div>

        {/* Clientes más frecuentes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Clientes más frecuentes
              </h2>
            </div>
            <span className="text-xs text-gray-400">Histórico</span>
          </div>
          <div className="px-5">
            {clientesTop.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin datos de clientes</p>
              </div>
            ) : (
              clientesTop.map((cliente, idx) => (
                <ClienteTopItem
                  key={cliente.id}
                  cliente={cliente}
                  index={idx}
                  formatearPrecio={formatearPrecio}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Próximas citas */}
      {dashboard.citas_cercanas && dashboard.citas_cercanas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Próximas citas
              </h2>
            </div>
            <span className="text-xs text-gray-400">Próximos días</span>
          </div>
          <div className="px-5">
            {dashboard.citas_cercanas.map((cita) => (
              <CitaCercanaItem key={cita.id} cita={cita} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
