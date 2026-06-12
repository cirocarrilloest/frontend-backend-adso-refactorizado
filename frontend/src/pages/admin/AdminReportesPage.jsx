// frontend/src/pages/admin/AdminReportesPage.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Scissors,
  Calendar,
  DollarSign,
  Download,
} from "lucide-react";
import { useCitas } from "../../hooks/useCitas";
import { useConfig } from "../../context/ConfigContext";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

export default function AdminReportesPage() {
  const { formatearPrecio } = useConfig();
  const {
    getDistribucionHoraria,
    getTasaCancelacion,
    getServiciosTop,
    getClientesTop,
    loading,
    error,
  } = useCitas();

  const [distribucion, setDistribucion] = useState([]);
  const [tasaCancelacion, setTasaCancelacion] = useState([]);
  const [serviciosTop, setServiciosTop] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [filtros, setFiltros] = useState({ fecha_inicio: "", fecha_fin: "" });

  useEffect(() => {
    const cargar = async () => {
      const params = {};
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        params.fecha_inicio = filtros.fecha_inicio;
        params.fecha_fin = filtros.fecha_fin;
      }
      const [dist, tasa, servicios, clientes] = await Promise.all([
        getDistribucionHoraria(params.fecha_inicio, params.fecha_fin),
        getTasaCancelacion(params.fecha_inicio, params.fecha_fin),
        getServiciosTop(5, params.fecha_inicio, params.fecha_fin),
        getClientesTop(5, params.fecha_inicio, params.fecha_fin),
      ]);
      setDistribucion(dist?.distribucion || []);
      setTasaCancelacion(tasa?.reporte || []);
      setServiciosTop(servicios?.servicios || []);
      setClientesTop(clientes?.clientes || []);
    };
    cargar();
  }, [filtros]);

  const aplicarFiltro = () => setFiltros({ ...filtros });

  if (loading && !distribucion.length) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reportes y Estadísticas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analiza el rendimiento del negocio
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700"
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
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={aplicarFiltro}
              className="w-full bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              Aplicar filtro
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold">Distribución de citas por hora</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-4 py-2 text-left">Hora</th>
                <th className="px-4 py-2 text-left">Total citas</th>
                <th className="px-4 py-2 text-left">Completadas</th>
                <th className="px-4 py-2 text-left">Canceladas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {distribucion.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-gray-400"
                  >
                    Sin datos
                  </td>
                </tr>
              )}
              {distribucion.map((h) => (
                <tr key={h.hora}>
                  <td className="px-4 py-2 font-medium">
                    {String(h.hora).padStart(2, "0")}:00
                  </td>
                  <td className="px-4 py-2">{h.total_citas}</td>
                  <td className="px-4 py-2 text-emerald-600">
                    {h.completadas}
                  </td>
                  <td className="px-4 py-2 text-rose-600">{h.canceladas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold">Tasa de cancelación por barbero</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-4 py-2 text-left">Barbero</th>
                <th className="px-4 py-2 text-left">Total citas</th>
                <th className="px-4 py-2 text-left">Canceladas</th>
                <th className="px-4 py-2 text-left">Tasa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {tasaCancelacion.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2 font-medium">{b.nombre}</td>
                  <td className="px-4 py-2">{b.total_citas}</td>
                  <td className="px-4 py-2 text-rose-600">{b.canceladas}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${b.tasa_cancelacion > 30 ? "bg-rose-100 text-rose-700" : b.tasa_cancelacion > 15 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {b.tasa_cancelacion || 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
