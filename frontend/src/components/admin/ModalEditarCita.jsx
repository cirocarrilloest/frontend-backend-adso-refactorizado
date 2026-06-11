// frontend/src/components/admin/ModalEditarCita.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Scissors,
  FileText,
} from "lucide-react";
import { editarCitaAdmin } from "../../services/citaService";
import { getBarberos } from "../../services/usuarioService";
import { getServicios } from "../../services/servicioService";

// Formateadores
const fmtHoraInput = (hora) => {
  if (!hora) return "09:00";
  return String(hora).slice(0, 5);
};

export default function ModalEditarCita({
  cita,
  isOpen,
  onClose,
  onCitaActualizada,
}) {
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    barbero_id: "",
    servicio_id: "",
    notas: "",
    estado: "",
  });
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales (barberos, servicios) y llenar formulario
  useEffect(() => {
    if (isOpen && cita) {
      const cargarDatos = async () => {
        setLoadingData(true);
        setError(null);
        try {
          const [barberosRes, serviciosRes] = await Promise.all([
            getBarberos(),
            getServicios(true),
          ]);

          setBarberos(barberosRes.barberos || barberosRes || []);
          setServicios(serviciosRes.servicios || serviciosRes || []);

          // Llenar formulario con datos de la cita
          setFormData({
            fecha: cita.fecha ? cita.fecha.split("T")[0] : "",
            hora: fmtHoraInput(cita.hora),
            barbero_id: cita.barbero_id || cita.barbero?.id || "",
            servicio_id: cita.servicio_id || cita.servicio?.id || "",
            notas: cita.notas || "",
            estado: cita.estado || "pendiente",
          });
        } catch (err) {
          setError("Error al cargar los datos necesarios");
          console.error(err);
        } finally {
          setLoadingData(false);
        }
      };
      cargarDatos();
    }
  }, [isOpen, cita]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fecha ||
      !formData.hora ||
      !formData.barbero_id ||
      !formData.servicio_id
    ) {
      setError("Todos los campos obligatorios deben estar llenos");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await editarCitaAdmin(cita.id, {
        fecha: formData.fecha,
        hora: formData.hora,
        barbero_id: parseInt(formData.barbero_id, 10),
        servicio_id: parseInt(formData.servicio_id, 10),
        notas: formData.notas,
        estado: formData.estado,
      });
      onCitaActualizada?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar la cita");
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    { value: "pendiente", label: "Pendiente" },
    { value: "confirmada", label: "Confirmada" },
    { value: "completada", label: "Completada" },
    { value: "cancelada", label: "Cancelada" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal - versión más compacta */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Header más compacto */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Editar Cita #{cita?.id}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Formulario - Layout de 2 columnas para campos pequeños */}
          <form onSubmit={handleSubmit} className="p-4">
            {loadingData ? (
              <div className="flex justify-center py-8">
                <RefreshCw size={24} className="animate-spin text-amber-400" />
              </div>
            ) : (
              <>
                {/* Error más compacto */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs mb-3">
                    <AlertTriangle size={12} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Grid de 2 columnas para campos pequeños */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Fecha */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar size={12} className="inline mr-1" /> Fecha *
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Clock size={12} className="inline mr-1" /> Hora *
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleChange}
                      required
                      step="60"
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Grid de 2 columnas para selects */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Barbero */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User size={12} className="inline mr-1" /> Barbero *
                    </label>
                    <select
                      name="barbero_id"
                      value={formData.barbero_id}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 truncate"
                    >
                      <option value="">Seleccionar</option>
                      {barberos.map((barbero) => (
                        <option key={barbero.id} value={barbero.id}>
                          {barbero.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Servicio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Scissors size={12} className="inline mr-1" /> Servicio *
                    </label>
                    <select
                      name="servicio_id"
                      value={formData.servicio_id}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 truncate"
                    >
                      <option value="">Seleccionar</option>
                      {servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.id}>
                          {servicio.nombre} ({servicio.duracion}min - $
                          {servicio.precio})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Estado - línea completa */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {estados.map((est) => (
                      <option key={est.value} value={est.value}>
                        {est.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notas - más compacta */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FileText size={12} className="inline mr-1" /> Notas
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    placeholder="Notas adicionales..."
                  />
                </div>

                {/* Botones más compactos */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
