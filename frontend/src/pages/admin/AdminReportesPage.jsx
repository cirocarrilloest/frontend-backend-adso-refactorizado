// frontend/src/pages/admin/AdminReportesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Scissors,
  Calendar,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useCitas } from "../../hooks/useCitas";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useConfig } from "../../context/ConfigContext";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

// Gráfico de barras para distribución horaria
function BarChart({ data, maxValue, formatearPrecio, rangoHorario }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No hay datos de distribución horaria</p>
      </div>
    );
  }

  const maxTotal = maxValue || Math.max(...data.map((d) => d.total_citas), 1);

  return (
    <div>
      {rangoHorario && (
        <div className="mb-3 text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 py-1 px-3 rounded-full inline-block">
          Horario laboral: {rangoHorario}
        </div>
      )}
      <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2 min-w-full">
        {data.map((item) => {
          const altura = (item.total_citas / maxTotal) * 100;

          return (
            <div
              key={item.hora}
              className="flex-1 text-center group min-w-[40px]"
            >
              <div className="relative">
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {item.total_citas} citas
                  {item.completadas > 0 && (
                    <span className="text-green-300 ml-1">
                      ({item.completadas} ✓)
                    </span>
                  )}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-t-lg transition-all duration-300 cursor-pointer hover:from-amber-500 hover:to-amber-600"
                  style={{
                    height: `${Math.max(altura, 4)}px`,
                    minHeight: altura > 0 ? "4px" : "2px",
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {String(item.hora).padStart(2, "0")}:00
              </p>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {item.total_citas}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tarjeta de estadística pequeña
function StatCardSmall({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function AdminReportesPage() {
  const { formatearPrecio } = useConfig();
  const {
    getDistribucionHoraria,
    getTasaCancelacion,
    getServiciosTop,
    getClientesTop,
    loading: citasLoading,
    error: citasError,
  } = useCitas();
  const { listarBarberos, loading: barberosLoading } = useUsuarios();

  const [distribucion, setDistribucion] = useState([]);
  const [tasaCancelacion, setTasaCancelacion] = useState([]);
  const [serviciosTop, setServiciosTop] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    barbero_id: null,
  });
  const [rangoHorario, setRangoHorario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Cargar barberos al inicio (CORREGIDO - con isMounted y eslint-disable)
  useEffect(() => {
    let isMounted = true;

    const cargarBarberos = async () => {
      try {
        const res = await listarBarberos();
        if (isMounted) {
          const lista = res?.barberos || [];
          setBarberos(lista);
          if (lista.length > 0 && !barberoSeleccionado) {
            setBarberoSeleccionado(lista[0]);
            setFiltros((prev) => ({ ...prev, barbero_id: lista[0].id }));
          }
        }
      } catch (e) {
        console.error("Error cargando barberos:", e);
      }
    };

    cargarBarberos();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listarBarberos]);

  // Inicializar fechas (últimos 30 días)
  useEffect(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    setFiltros((prev) => ({
      ...prev,
      fecha_inicio: hace30Dias.toISOString().split("T")[0],
      fecha_fin: hoy.toISOString().split("T")[0],
    }));
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin,
        barbero_id: filtros.barbero_id || undefined,
      };

      const [dist, tasa, servicios, clientes] = await Promise.all([
        getDistribucionHoraria(
          params.fecha_inicio,
          params.fecha_fin,
          params.barbero_id,
        ),
        getTasaCancelacion(params.fecha_inicio, params.fecha_fin),
        getServiciosTop(5, params.fecha_inicio, params.fecha_fin),
        getClientesTop(5, params.fecha_inicio, params.fecha_fin),
      ]);

      setDistribucion(dist?.distribucion || []);
      setRangoHorario(
        dist?.rango_horario || dist?.rango_horario_global || null,
      );
      setTasaCancelacion(tasa?.reporte || []);
      setServiciosTop(servicios?.servicios || []);
      setClientesTop(clientes?.clientes || []);
    } catch (err) {
      console.error("Error cargando reportes:", err);
      setError(
        err.response?.data?.message || err.message || "Error al cargar datos",
      );
    } finally {
      setLoading(false);
    }
  }, [
    filtros,
    getDistribucionHoraria,
    getTasaCancelacion,
    getServiciosTop,
    getClientesTop,
  ]);

  useEffect(() => {
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      cargarDatos();
    }
  }, [cargarDatos]);

  const handleBarberoChange = (barbero) => {
    setBarberoSeleccionado(barbero);
    setFiltros((prev) => ({ ...prev, barbero_id: barbero?.id || null }));
  };

  const aplicarFiltro = () => {
    cargarDatos();
  };

  // ✅ CORREGIDO: Calcular estadísticas de distribución con validación de tipos
  const totalCitas = distribucion.reduce((sum, d) => {
    const val =
      typeof d.total_citas === "number"
        ? d.total_citas
        : parseInt(d.total_citas) || 0;
    return sum + val;
  }, 0);

  const totalCompletadas = distribucion.reduce((sum, d) => {
    const val =
      typeof d.completadas === "number"
        ? d.completadas
        : parseInt(d.completadas) || 0;
    return sum + val;
  }, 0);

  const maxValue = Math.max(
    ...distribucion.map((d) => {
      const val =
        typeof d.total_citas === "number"
          ? d.total_citas
          : parseInt(d.total_citas) || 0;
      return val;
    }),
    1,
  );

  const horaPico = distribucion.reduce(
    (max, d) => {
      const citasActual =
        typeof d.total_citas === "number"
          ? d.total_citas
          : parseInt(d.total_citas) || 0;
      const citasMax =
        typeof max.total_citas === "number"
          ? max.total_citas
          : parseInt(max.total_citas) || 0;
      return citasActual > citasMax ? d : max;
    },
    { hora: "N/A", total_citas: 0 },
  );

  if ((loading || barberosLoading) && distribucion.length === 0)
    return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarDatos} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reportes y Estadísticas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analiza el rendimiento del negocio por barbero
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Barbero
            </label>
            <select
              value={barberoSeleccionado?.id || ""}
              onChange={(e) => {
                const barbero = barberos.find(
                  (b) => b.id === parseInt(e.target.value),
                );
                handleBarberoChange(barbero);
              }}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todos los barberos</option>
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_inicio: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) =>
                setFiltros({ ...filtros, fecha_fin: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={aplicarFiltro}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Filter size={14} /> Aplicar filtro
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas de distribución */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardSmall
          title="Total citas"
          value={totalCitas}
          icon={Calendar}
          color="blue"
        />
        <StatCardSmall
          title="Completadas"
          value={totalCompletadas}
          icon={CheckCircle2}
          color="green"
        />
        <StatCardSmall
          title="Hora pico"
          value={`${String(horaPico.hora).padStart(2, "0")}:00`}
          icon={Clock}
          color="amber"
        />
        <StatCardSmall
          title="Promedio/hora"
          value={(totalCitas / (distribucion.length || 1)).toFixed(1)}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Gráfico de distribución horaria */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Distribución de citas por hora
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-400" /> Citas
            </span>
            {barberoSeleccionado && (
              <span className="flex items-center gap-1">
                <User size={12} /> {barberoSeleccionado.nombre}
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <BarChart
            data={distribucion}
            maxValue={maxValue}
            formatearPrecio={formatearPrecio}
            rangoHorario={rangoHorario}
          />
          {distribucion.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay citas en el período seleccionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Tasa de cancelación por barbero */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Tasa de cancelación por barbero
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Barbero
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total citas
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Canceladas
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tasa
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {tasaCancelacion.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Sin datos de cancelaciones
                  </td>
                </tr>
              ) : (
                tasaCancelacion.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {b.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {b.total_citas}
                    </td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400">
                      {b.canceladas}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          b.tasa_cancelacion > 30
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : b.tasa_cancelacion > 15
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}
                      >
                        {b.tasa_cancelacion || 0}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Servicios y Clientes Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios más solicitados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Scissors size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Servicios más solicitados
              </h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {serviciosTop.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                Sin datos de servicios
              </div>
            ) : (
              serviciosTop.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {s.nombre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatearPrecio(s.precio)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {s.total_citas} citas
                    </p>
                    <p className="text-xs text-green-600">
                      {s.tasa_exito || 0}% éxito
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clientes más frecuentes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Clientes más frecuentes
              </h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {clientesTop.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                Sin datos de clientes
              </div>
            ) : (
              clientesTop.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {c.nombre?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {c.nombre}
                      </p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {c.total_citas} citas
                    </p>
                    <p className="text-xs text-emerald-600">
                      {formatearPrecio(c.total_gastado)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
