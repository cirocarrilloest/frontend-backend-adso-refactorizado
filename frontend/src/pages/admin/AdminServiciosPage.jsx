// frontend/src/pages/admin/AdminServiciosPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, RefreshCw, Power, PowerOff } from "lucide-react";
import { useServicios } from "../../hooks/useServicios";
import { useConfig } from "../../context/ConfigContext";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Modal } from "../../components/ui/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export default function AdminServiciosPage() {
  const { listar, crear, actualizar, eliminar, toggleActivo, loading, error } =
    useServicios();
  const { formatearPrecio } = useConfig();

  const [servicios, setServicios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    duracion: 30,
    precio: 0,
    activo: true,
  });

  const cargarServicios = async () => {
    const result = await listar(false);
    if (result) setServicios(result.servicios || []);
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // Función para obtener el valor a mostrar en el input
  const getDisplayValue = (field) => {
    const value = formData[field];
    if (value === "" || value === null || value === undefined) {
      return "";
    }
    return value;
  };

  // Manejar cambio en inputs numéricos (permite string vacío)
  const handleNumberChange = (e, field) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  // Validar al perder foco
  const handleBlur = (field) => {
    const value = formData[field];
    if (field === "duracion") {
      if (value === "" || value === null || value === undefined) {
        setFormData({ ...formData, duracion: 30 });
      } else {
        const num = parseInt(value);
        if (isNaN(num) || num < 5) {
          setFormData({ ...formData, duracion: 30 });
        } else {
          setFormData({ ...formData, duracion: num });
        }
      }
    } else if (field === "precio") {
      if (value === "" || value === null || value === undefined) {
        setFormData({ ...formData, precio: 0 });
      } else {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          setFormData({ ...formData, precio: 0 });
        } else {
          setFormData({ ...formData, precio: num });
        }
      }
    }
  };

  // Obtener valor numérico seguro para enviar
  const getSafeNumber = (value, field) => {
    if (value === "" || value === null || value === undefined) {
      return field === "duracion" ? 30 : 0;
    }
    const num = field === "duracion" ? parseInt(value) : parseFloat(value);
    if (isNaN(num)) {
      return field === "duracion" ? 30 : 0;
    }
    if (field === "duracion" && num < 5) return 30;
    if (field === "precio" && num < 0) return 0;
    return num;
  };

  const handleSubmit = async () => {
    if (!formData.nombre) {
      alert("Por favor completa el nombre del servicio");
      return;
    }

    const duracion = getSafeNumber(formData.duracion, "duracion");
    const precio = getSafeNumber(formData.precio, "precio");

    if (duracion < 5) {
      alert("La duración debe ser al menos 5 minutos");
      return;
    }

    if (precio <= 0) {
      alert("El precio debe ser mayor a 0");
      return;
    }

    setSubmitting(true);
    let result;

    const dataToSend = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      duracion: duracion,
      precio: precio,
      activo: formData.activo,
    };

    if (editando) {
      result = await actualizar(editando.id, dataToSend);
    } else {
      result = await crear(dataToSend);
    }

    if (result) {
      await cargarServicios();
      setModalOpen(false);
      resetForm();
    }
    setSubmitting(false);
  };

  const handleToggle = async (servicio) => {
    await toggleActivo(servicio.id);
    await cargarServicios();
  };

  const handleEliminar = async () => {
    const result = await eliminar(eliminando.id);
    if (result) {
      await cargarServicios();
      setEliminando(null);
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

  if (loading && !servicios.length) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarServicios} />;

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
                  onClick={() => handleToggle(servicio)}
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
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración (min) *
              </label>
              <input
                type="number"
                value={getDisplayValue("duracion")}
                onChange={(e) => handleNumberChange(e, "duracion")}
                onBlur={() => handleBlur("duracion")}
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
                value={getDisplayValue("precio")}
                onChange={(e) => handleNumberChange(e, "precio")}
                onBlur={() => handleBlur("precio")}
                min={0}
                step={1000}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) =>
                setFormData({ ...formData, activo: e.target.checked })
              }
            />
            <span className="text-sm">Activo</span>
          </label>
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

      <ConfirmModal
        isOpen={!!eliminando}
        onClose={() => setEliminando(null)}
        onConfirm={handleEliminar}
        title="Eliminar servicio"
        message={`¿Estás seguro de eliminar "${eliminando?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
