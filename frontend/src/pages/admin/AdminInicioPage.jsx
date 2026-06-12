// frontend/src/pages/admin/AdminInicioPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar,
  TrendingUp,
  Users,
  Scissors,
  DollarSign,
  Clock,
} from "lucide-react";
import { useCitas } from "../../hooks/useCitas";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useConfig } from "../../context/ConfigContext";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminInicioPage() {
  const { getDashboard, loading: citasLoading, error: citasError } = useCitas();
  const { listar: listarUsuarios, loading: usuariosLoading } = useUsuarios();
  const { formatearPrecio } = useConfig();

  const [dashboard, setDashboard] = useState(null);
  const [clientesCount, setClientesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoaded = useRef(false); // ✅ Evitar doble carga en React StrictMode

  const loadData = useCallback(async () => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    setLoading(true);
    setError(null);
    try {
      const [dash, usuarios] = await Promise.all([
        getDashboard(),
        listarUsuarios({ rol: "cliente" }),
      ]);
      setDashboard(dash?.dashboard);
      setClientesCount(usuarios?.usuarios?.length || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [getDashboard, listarUsuarios]);

  useEffect(() => {
    loadData();
  }, [loadData]); // ✅ Dependencia estable

  if (loading) return <Spinner />;
  if (error)
    return (
      <ErrorBanner
        message={error}
        onRetry={() => {
          hasLoaded.current = false;
          loadData();
        }}
      />
    );

  const stats = [
    {
      title: "Citas hoy",
      value: dashboard?.citas_hoy || 0,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Citas pendientes",
      value: dashboard?.citas_pendientes || 0,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      title: "Ingresos del mes",
      value: formatearPrecio(dashboard?.ingresos_mes || 0),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Clientes totales",
      value: clientesCount,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Barberos activos",
      value: dashboard?.barberos_activos || 0,
      icon: Scissors,
      color: "bg-indigo-500",
    },
    {
      title: "Tasa ocupación",
      value: `${dashboard?.tasa_ocupacion || 0}%`,
      icon: TrendingUp,
      color: "bg-rose-500",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resumen general del negocio
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
    </div>
  );
}
