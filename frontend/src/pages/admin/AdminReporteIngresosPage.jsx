// frontend/src/pages/admin/AdminReporteIngresosPage.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useCitas } from "../../hooks/useCitas";
import { useConfig } from "../../context/ConfigContext";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { useToast } from "../../context/ToastContext";

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function AdminReporteIngresosPage() {
  const { addToast } = useToast();
  const { formatearPrecio } = useConfig();
  const { getReporteIngresos, loading, error } = useCitas();

  const [reporte, setReporte] = useState(null);
  const [periodo, setPeriodo] = useState("mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [exportando, setExportando] = useState(false);

  // Inicializar fechas: últimos 30 días
  useEffect(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    setFechaFin(hoy.toISOString().split("T")[0]);
    setFechaInicio(hace30Dias.toISOString().split("T")[0]);
  }, []);

  const cargarReporte = async () => {
    if (!fechaInicio || !fechaFin) return;
    try {
      const data = await getReporteIngresos(periodo, fechaInicio, fechaFin);
      if (data && data.reporte) {
        setReporte(data);
      } else {
        setReporte({
          reporte: Array.isArray(data) ? data : [],
          periodo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        });
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Error al cargar reporte",
        "error",
      );
    }
  };

  useEffect(() => {
    if (fechaInicio && fechaFin) cargarReporte();
  }, [periodo, fechaInicio, fechaFin]);

  const calcularTotales = () => {
    if (!reporte?.reporte?.length)
      return { ingresos: 0, citas: 0, completadas: 0, canceladas: 0 };
    let ingresos = 0,
      citas = 0,
      completadas = 0,
      canceladas = 0;
    for (const item of reporte.reporte) {
      ingresos += Number(item.ingreso_total) || 0;
      citas += Number(item.total_citas) || 0;
      completadas += Number(item.citas_completadas) || 0;
      canceladas += Number(item.citas_canceladas) || 0;
    }
    return { ingresos, citas, completadas, canceladas };
  };

  const totales = calcularTotales();
  const ticketPromedio =
    totales.completadas > 0 ? totales.ingresos / totales.completadas : 0;
  const tasaExito =
    totales.citas > 0 ? (totales.completadas / totales.citas) * 100 : 0;

  const exportarCSV = () => {
    if (!reporte?.reporte?.length) {
      addToast("No hay datos para exportar", "error");
      return;
    }
    setExportando(true);
    try {
      const escapeCSV = (v) => {
        if (v === undefined || v === null) return '""';
        const s = String(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n"))
          return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const headers = [
        "Período",
        "Total Citas",
        "Completadas",
        "Canceladas",
        "Ticket Promedio",
        "Ingreso Total",
      ];
      const rows = reporte.reporte.map((item) => [
        escapeCSV(item.periodo),
        Number(item.total_citas) || 0,
        Number(item.citas_completadas) || 0,
        Number(item.citas_canceladas) || 0,
        formatearPrecio(Number(item.ticket_promedio) || 0),
        formatearPrecio(Number(item.ingreso_total) || 0),
      ]);
      rows.push([
        "TOTAL",
        totales.citas,
        totales.completadas,
        totales.canceladas,
        formatearPrecio(ticketPromedio),
        formatearPrecio(totales.ingresos),
      ]);
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_ingresos_${periodo}_${fechaInicio}_a_${fechaFin}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      addToast("Reporte exportado exitosamente", "success");
    } catch (e) {
      addToast("Error al exportar: " + e.message, "error");
    } finally {
      setExportando(false);
    }
  };

  if (loading && !reporte) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarReporte} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reporte de Ingresos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Análisis detallado de ingresos del negocio
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Período
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="dia">Día</option>
              <option value="mes">Mes</option>
              <option value="año">Año</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportarCSV}
              disabled={exportando || !reporte?.reporte?.length}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <Download size={16} />{" "}
              {exportando ? "Exportando..." : "Exportar CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Ingresos Totales"
          value={formatearPrecio(totales.ingresos)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Citas Completadas"
          value={totales.completadas}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Citas Canceladas"
          value={totales.canceladas}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          label="Tasa de Éxito"
          value={`${tasaExito.toFixed(1)}%`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Tabla de ingresos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-500" />
              <h2 className="font-semibold">
                Ingresos por{" "}
                {periodo === "dia" ? "Día" : periodo === "mes" ? "Mes" : "Año"}
              </h2>
            </div>
            <span className="text-xs text-gray-400">
              {reporte?.reporte?.length || 0} períodos
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {periodo === "dia"
                    ? "Fecha"
                    : periodo === "mes"
                      ? "Mes"
                      : "Año"}
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Completadas
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Canceladas
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ticket Promedio
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {reporte?.reporte?.map((item, idx) => {
                const completadas = Number(item.citas_completadas) || 0;
                const ticketItem =
                  completadas > 0
                    ? (Number(item.ingreso_total) || 0) / completadas
                    : 0;
                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                      {item.periodo}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {Number(item.total_citas) || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                      {completadas}
                    </td>
                    <td className="px-5 py-3 text-center text-rose-600 dark:text-rose-400 font-medium">
                      {Number(item.citas_canceladas) || 0}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">
                      {formatearPrecio(ticketItem)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatearPrecio(item.ingreso_total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800/80 font-semibold border-t border-gray-200 dark:border-white/10">
              <tr>
                <td className="px-5 py-3 text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-5 py-3 text-center text-gray-900 dark:text-white">
                  {totales.citas}
                </td>
                <td className="px-5 py-3 text-center text-emerald-600 dark:text-emerald-400">
                  {totales.completadas}
                </td>
                <td className="px-5 py-3 text-center text-rose-600 dark:text-rose-400">
                  {totales.canceladas}
                </td>
                <td className="px-5 py-3 text-right text-gray-900 dark:text-white">
                  {formatearPrecio(ticketPromedio)}
                </td>
                <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatearPrecio(totales.ingresos)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
