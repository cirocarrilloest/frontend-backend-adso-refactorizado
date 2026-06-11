// frontend/src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Scissors,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { getDashboard } from "../../services/citaService";
import { getUsuarios } from "../../services/usuarioService";
import { useConfig } from "../../context/ConfigContext";

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {trend !== undefined && (
          <p
            className={`text-xs mt-2 flex items-center gap-1 ${
              trend >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}% vs mes anterior
          </p>
        )}
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientesCount, setClientesCount] = useState(0);
  const { formatearPrecio } = useConfig();

  const cargar = async () => {
    setLoading(true);
    try {
      const [dash, usuarios] = await Promise.all([
        getDashboard(),
        getUsuarios({ rol: "cliente" }),
      ]);
      setDashboard(dash.dashboard);
      setClientesCount(usuarios.total || usuarios.usuarios?.length || 0);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

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
      icon: Calendar,
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
};

export default DashboardPage;
