// frontend/src/pages/admin/ConfiguracionPage.jsx
import React, { useState, useEffect } from "react";
import { Save, RefreshCw, AlertCircle } from "lucide-react";
import {
  getConfiguracion,
  updateMultipleConfig,
} from "../../services/configService";

export const ConfiguracionPage = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const cargarConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getConfiguracion();
      setConfig(res.configuracion || {});
    } catch (err) {
      setError(err.response?.data?.message || "Error cargando configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfig();
  }, []);

  const handleChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], valor: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updates = {};
      Object.entries(config).forEach(([key, data]) => {
        updates[key] = data.valor;
      });
      await updateMultipleConfig(updates);
      setSuccess("Configuración guardada exitosamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error guardando configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  const diasSemana = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configuración general del sistema
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          ✓ {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Horario laboral */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Horario laboral
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora de apertura
              </label>
              <input
                type="time"
                value={config.horario_apertura?.valor || "09:00"}
                onChange={(e) =>
                  handleChange("horario_apertura", e.target.value)
                }
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hora de cierre
              </label>
              <input
                type="time"
                value={config.horario_cierre?.valor || "20:00"}
                onChange={(e) => handleChange("horario_cierre", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Días laborales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Días laborales
          </h2>
          <div className="flex flex-wrap gap-3">
            {diasSemana.map((dia) => {
              const current = config.dias_laborales?.valor || [];
              const isSelected = current.includes(dia);
              return (
                <button
                  key={dia}
                  onClick={() => {
                    const newDias = isSelected
                      ? current.filter((d) => d !== dia)
                      : [...current, dia];
                    handleChange("dias_laborales", newDias);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    isSelected
                      ? "bg-amber-400 text-gray-900"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuración de moneda */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Moneda y formatos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moneda
              </label>
              <select
                value={config.moneda?.valor || "COP"}
                onChange={(e) => handleChange("moneda", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
                <option value="MXN">MXN - Peso Mexicano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Formato de moneda
              </label>
              <select
                value={config.formato_moneda?.valor || "es-CO"}
                onChange={(e) => handleChange("formato_moneda", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="es-CO">Colombia (es-CO)</option>
                <option value="en-US">Estados Unidos (en-US)</option>
                <option value="es-ES">España (es-ES)</option>
                <option value="es-MX">México (es-MX)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuración de cancelación */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Políticas de cancelación
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Permitir cancelación de citas
              </span>
              <button
                onClick={() =>
                  handleChange(
                    "permitir_cancelacion",
                    !config.permitir_cancelacion?.valor,
                  )
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.permitir_cancelacion?.valor
                    ? "bg-amber-400"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    config.permitir_cancelacion?.valor
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horas mínimas de antelación para cancelar
              </label>
              <input
                type="number"
                value={config.horas_min_cancelacion?.valor || 2}
                onChange={(e) =>
                  handleChange(
                    "horas_min_cancelacion",
                    parseInt(e.target.value),
                  )
                }
                min={1}
                max={48}
                className="w-32 rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Horas antes de la cita
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
