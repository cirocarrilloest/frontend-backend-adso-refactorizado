// frontend/src/pages/admin/ServiciosPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, RefreshCw, Power, PowerOff } from "lucide-react";
import {
  getServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  toggleActivoServicio,
} from "../../services/servicioService";
import { Modal } from "../../components/ui/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useConfig } from "../../context/ConfigContext";

export const ServiciosPage = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { formatearPrecio } = useConfig();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    duracion: 30,
    precio: 0,
    activo: true,
  });

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const res = await getServicios();
      setServicios(res.servicios || []);
    } catch (error) {
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleSubmit = async () => {
    if (!formData.nombre || formData.duracion <= 0 || formData.precio <= 0) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setSubmitting(true);
    try {
      if (editando) {
        await actualizarServicio(editando.id, formData);
      } else {
        await crearServicio(formData);
      }
      await cargarServicios();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error guardando servicio:", error);
      alert(error.response?.data?.message || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivo = async (servicio) => {
    try {
      await toggleActivoServicio(servicio.id);
      await cargarServicios();
    } catch (error) {
      console.error("Error toggling servicio:", error);
      alert(error.response?.data?.message || "Error al cambiar estado");
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarServicio(eliminando.id);
      await cargarServicios();
      setEliminando(null);
    } catch (error) {
      console.error("Error eliminando servicio:", error);
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  const resetForm = () => {
    setEditando(null);
    setFormData({
      nombre: "",
      descripcion: "",
      duracion: 30,
      precio: 0,
      activo: true,
    });
  };

  const abrirModal = (servicio = null) => {
    if (servicio) {
      setEditando(servicio);
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || "",
        duracion: servicio.duracion,
        precio: servicio.precio,
        activo: servicio.activo === 1,
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Servicios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los servicios de la barbería
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-amber-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors"
        >
          <Plus size={16} /> Nuevo servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all ${
              servicio.activo
                ? "border-gray-100 dark:border-white/5"
                : "border-gray-200 dark:border-gray-700 opacity-60"
            }`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {servicio.nombre}
                </h3>
                <button
                  onClick={() => handleToggleActivo(servicio)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    servicio.activo
                      ? "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={servicio.activo ? "Desactivar" : "Activar"}
                >
                  {servicio.activo ? (
                    <Power size={16} />
                  ) : (
                    <PowerOff size={16} />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {servicio.descripcion || "Sin descripción"}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Duración</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {servicio.duracion} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Precio</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {formatearPrecio(servicio.precio)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => abrirModal(servicio)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit size={14} /> Editar
                </button>
                <button
                  onClick={() => setEliminando(servicio)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {servicios.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No hay servicios registrados
        </div>
      )}

      {/* Modal de servicio */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? "Editar servicio" : "Nuevo servicio"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Ej: Corte de cabello"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Descripción del servicio"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración (min) *
              </label>
              <input
                type="number"
                value={formData.duracion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duracion: parseInt(e.target.value),
                  })
                }
                min={5}
                max={240}
                step={5}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio *
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: parseInt(e.target.value) })
                }
                min={0}
                step={1000}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-amber-400 text-gray-900 py-2 rounded-lg font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {submitting ? "Guardando..." : editando ? "Actualizar" : "Crear"}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmModal
        isOpen={!!eliminando}
        onClose={() => setEliminando(null)}
        onConfirm={handleEliminar}
        title="Eliminar servicio"
        message={`¿Estás seguro de eliminar "${eliminando?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ServiciosPage;
