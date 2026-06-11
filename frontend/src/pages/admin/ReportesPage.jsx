// frontend/src/pages/admin/ReportesPage.jsx
import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Scissors,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useConfig } from "../../context/ConfigContext";

export const ReportesPage = () => {
  const { formatearPrecio } = useConfig();
  const [periodo, setPeriodo] = useState("mes");

  // Datos de ejemplo - en producción vendrían de la API
  const stats = [
    {
      title: "Ingresos totales",
      value: formatearPrecio(12500000),
      icon: DollarSign,
      trend: "+15%",
    },
    { title: "Citas completadas", value: 245, icon: Calendar, trend: "+8%" },
    { title: "Clientes nuevos", value: 42, icon: Users, trend: "+12%" },
    {
      title: "Servicios más popular",
      value: "Corte de cabello",
      icon: Scissors,
      trend: "245 veces",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reportes y Estadísticas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analiza el rendimiento del negocio
          </p>
        </div>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="trimestre">Este trimestre</option>
          <option value="año">Este año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-green-500 mt-2">{stat.trend}</p>
              </div>
              <stat.icon size={20} className="text-amber-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Próximamente más reportes detallados
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Los reportes detallados estarán disponibles en la siguiente versión.
        </p>
      </div>
    </div>
  );
};

export default ReportesPage;
