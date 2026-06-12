// frontend/src/pages/admin/AdminHorariosPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useUsuarios } from "../../hooks/useUsuarios";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";

const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export default function AdminHorariosPage() {
  const { addToast } = useToast();
  const {
    listarBarberos,
    horarioBarbero,
    configurarHorario,
    eliminarHorario,
    loading,
    error,
  } = useUsuarios();

  const [barberos, setBarberos] = useState([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    dia_semana: "lunes",
    hora_inicio: "09:00",
    hora_fin: "18:00",
  });
  const [cargando, setCargando] = useState(false);

  const cargarBarberos = async () => {
    const result = await listarBarberos();
    if (result) {
      setBarberos(result.barberos || []);
      if (result.barberos?.length > 0)
        setBarberoSeleccionado(result.barberos[0]);
    }
  };

  const cargarHorarios = async (barberoId) => {
    if (!barberoId) return;
    const result = await horarioBarbero(barberoId);
    if (result) setHorarios(result.horarios || []);
  };

  useEffect(() => {
    cargarBarberos();
  }, []);
  useEffect(() => {
    if (barberoSeleccionado) cargarHorarios(barberoSeleccionado.id);
  }, [barberoSeleccionado]);

  const handleGuardarHorario = async () => {
    if (!barberoSeleccionado) return;
    setCargando(true);
    const result = await configurarHorario(barberoSeleccionado.id, {
      dia_semana: formData.dia_semana,
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
    });
    if (result) {
      addToast("Horario configurado exitosamente", "success");
      setModalOpen(false);
      cargarHorarios(barberoSeleccionado.id);
    }
    setCargando(false);
  };

  const handleEliminarHorario = async (dia) => {
    if (!barberoSeleccionado) return;
    if (!confirm(`¿Eliminar horario del ${dia}?`)) return;
    const result = await eliminarHorario(barberoSeleccionado.id, dia);
    if (result) {
      addToast("Horario eliminado exitosamente", "success");
      cargarHorarios(barberoSeleccionado.id);
    }
  };

  const getHorarioPorDia = (dia) => horarios.find((h) => h.dia_semana === dia);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarBarberos} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <select
          value={barberoSeleccionado?.id || ""}
          onChange={(e) => {
            const barbero = barberos.find(
              (b) => b.id === parseInt(e.target.value),
            );
            setBarberoSeleccionado(barbero);
          }}
          className="border rounded-xl px-3 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Seleccionar barbero</option>
          {barberos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!barberoSeleccionado}
          className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-amber-600 transition-colors"
        >
          <Plus size={16} /> Agregar horario
        </button>
      </div>
      {barberoSeleccionado && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="font-semibold">
              Horarios de {barberoSeleccionado.nombre}
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {diasSemana.map((dia) => {
              const horario = getHorarioPorDia(dia);
              return (
                <div
                  key={dia}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span className="text-sm font-medium capitalize">{dia}</span>
                  {horario ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {horario.hora_inicio?.slice(0, 5)} -{" "}
                        {horario.hora_fin?.slice(0, 5)}
                      </span>
                      <button
                        onClick={() => handleEliminarHorario(dia)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No configurado
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo="Configurar horario"
      >
        <div className="space-y-3">
          <select
            value={formData.dia_semana}
            onChange={(e) =>
              setFormData({ ...formData, dia_semana: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {diasSemana.map((dia) => (
              <option key={dia} value={dia}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) =>
                setFormData({ ...formData, hora_inicio: e.target.value })
              }
              className="border rounded-xl px-3 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="time"
              value={formData.hora_fin}
              onChange={(e) =>
                setFormData({ ...formData, hora_fin: e.target.value })
              }
              className="border rounded-xl px-3 py-2 text-sm dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            onClick={handleGuardarHorario}
            disabled={cargando}
            className="w-full bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {cargando ? "Guardando..." : "Guardar horario"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
