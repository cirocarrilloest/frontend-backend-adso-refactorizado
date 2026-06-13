// frontend/src/pages/admin/AdminHorariosPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  User,
  AlertCircle,
  Save,
  Edit2,
  X,
} from "lucide-react";
import { useUsuarios } from "../../hooks/useUsuarios";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";

const DIAS_SEMANA = [
  { id: "lunes", label: "Lunes", short: "Lun", order: 1 },
  { id: "martes", label: "Martes", short: "Mar", order: 2 },
  { id: "miercoles", label: "Miércoles", short: "Mié", order: 3 },
  { id: "jueves", label: "Jueves", short: "Jue", order: 4 },
  { id: "viernes", label: "Viernes", short: "Vie", order: 5 },
  { id: "sabado", label: "Sábado", short: "Sáb", order: 6 },
  { id: "domingo", label: "Domingo", short: "Dom", order: 7 },
];

// Componente de tarjeta de día
function DiaHorarioCard({ dia, horario, onEdit, onDelete, onCopy }) {
  const tieneHorario = !!horario;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        tieneHorario
          ? "bg-white dark:bg-gray-800 border-green-200 dark:border-green-800/50 hover:shadow-md"
          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-amber-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                tieneHorario
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              }`}
            >
              {tieneHorario ? <CheckCircle size={16} /> : <XCircle size={16} />}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {dia.label}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {tieneHorario && (
              <button
                onClick={() => onCopy(dia.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Copiar horario"
              >
                <Copy size={14} />
              </button>
            )}
            <button
              onClick={() => onEdit(dia.id, horario)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              title={tieneHorario ? "Editar horario" : "Agregar horario"}
            >
              {tieneHorario ? <Edit2 size={14} /> : <Plus size={14} />}
            </button>
            {tieneHorario && (
              <button
                onClick={() => onDelete(dia.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Eliminar horario"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {tieneHorario ? (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {horario.hora_inicio?.slice(0, 5)} -{" "}
              {horario.hora_fin?.slice(0, 5)}
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <AlertCircle size={12} /> No configurado
          </p>
        )}
      </div>
    </div>
  );
}

// Modal de edición de horario
function HorarioModal({
  isOpen,
  onClose,
  onSave,
  diaSeleccionado,
  horarioActual,
  cargando,
}) {
  const [formData, setFormData] = useState({
    dia_semana: "",
    hora_inicio: "09:00",
    hora_fin: "18:00",
  });
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (diaSeleccionado) {
      setFormData({
        dia_semana: diaSeleccionado,
        hora_inicio: horarioActual?.hora_inicio?.slice(0, 5) || "09:00",
        hora_fin: horarioActual?.hora_fin?.slice(0, 5) || "18:00",
      });
    }
    setError(null);
  }, [diaSeleccionado, horarioActual, isOpen]);

  const handleSubmit = () => {
    if (formData.hora_inicio >= formData.hora_fin) {
      setError("La hora de inicio debe ser menor que la hora de fin");
      return;
    }
    onSave(formData);
  };

  const diaLabel =
    DIAS_SEMANA.find((d) => d.id === diaSeleccionado)?.label || diaSeleccionado;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configurar horario - ${diaLabel}`}
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora de inicio
          </label>
          <div className="relative">
            <Clock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) =>
                setFormData({ ...formData, hora_inicio: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              step="1800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hora de fin
          </label>
          <div className="relative">
            <Clock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="time"
              value={formData.hora_fin}
              onChange={(e) =>
                setFormData({ ...formData, hora_fin: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              step="1800"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={cargando}
            className="flex-1 bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {cargando ? "Guardando..." : "Guardar horario"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Modal de copiar horario
function CopiarHorarioModal({ isOpen, onClose, onCopy, diasOrigen, cargando }) {
  const [selectedDays, setSelectedDays] = useState([]);

  const handleToggleDay = (diaId) => {
    setSelectedDays((prev) =>
      prev.includes(diaId) ? prev.filter((d) => d !== diaId) : [...prev, diaId],
    );
  };

  const handleSelectAll = () => {
    if (selectedDays.length === DIAS_SEMANA.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(DIAS_SEMANA.map((d) => d.id));
    }
  };

  const handleSubmit = () => {
    if (selectedDays.length === 0) return;
    onCopy(selectedDays);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copiar horario a otros días"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Selecciona los días destino:
          </span>
          <button
            onClick={handleSelectAll}
            className="text-xs text-amber-500 hover:text-amber-600"
          >
            {selectedDays.length === DIAS_SEMANA.length
              ? "Deseleccionar todo"
              : "Seleccionar todo"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DIAS_SEMANA.map((dia) => (
            <label
              key={dia.id}
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(dia.id)}
                onChange={() => handleToggleDay(dia.id)}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {dia.label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={cargando || selectedDays.length === 0}
            className="flex-1 bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {cargando ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Copy size={16} />
            )}
            {cargando
              ? "Copiando..."
              : `Copiar a ${selectedDays.length} día(s)`}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}

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
  const [horarios, setHorarios] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [copiarModalOpen, setCopiarModalOpen] = useState(false);
  const [diaEditando, setDiaEditando] = useState(null);
  const [horarioEditando, setHorarioEditando] = useState(null);
  const [horarioOrigenCopy, setHorarioOrigenCopy] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [inicializado, setInicializado] = useState(false);

  // Cargar barberos solo una vez al montar
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const result = await listarBarberos();
        if (result) {
          const lista = result.barberos || [];
          setBarberos(lista);
          if (lista.length > 0) {
            setBarberoSeleccionado(lista[0]);
          }
          setInicializado(true);
        }
      } catch (err) {
        console.error("Error al cargar barberos:", err);
      }
    };

    cargarDatosIniciales();
  }, []); // ← Solo se ejecuta al montar

  // Cargar horarios cuando cambia el barbero seleccionado
  useEffect(() => {
    if (barberoSeleccionado && inicializado) {
      const cargarHorariosBarbero = async () => {
        try {
          const result = await horarioBarbero(barberoSeleccionado.id);
          if (result) {
            const horariosMap = {};
            (result.horarios || []).forEach((h) => {
              horariosMap[h.dia_semana] = h;
            });
            setHorarios(horariosMap);
          }
        } catch (err) {
          console.error("Error al cargar horarios:", err);
        }
      };

      cargarHorariosBarbero();
    }
  }, [barberoSeleccionado?.id, inicializado]); // ← Dependencia estable

  const barberosFiltrados = barberos.filter((b) =>
    b.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleGuardarHorario = async (formData) => {
    if (!barberoSeleccionado) return;
    setCargando(true);
    try {
      const result = await configurarHorario(barberoSeleccionado.id, {
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      });
      if (result) {
        addToast("Horario configurado exitosamente", "success");
        setModalOpen(false);
        setDiaEditando(null);
        setHorarioEditando(null);

        // Recargar horarios
        const updatedResult = await horarioBarbero(barberoSeleccionado.id);
        if (updatedResult) {
          const horariosMap = {};
          (updatedResult.horarios || []).forEach((h) => {
            horariosMap[h.dia_semana] = h;
          });
          setHorarios(horariosMap);
        }
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Error al guardar horario",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarHorario = async (dia) => {
    if (!barberoSeleccionado) return;
    setCargando(true);
    try {
      const result = await eliminarHorario(barberoSeleccionado.id, dia);
      if (result) {
        addToast(`Horario del ${dia} eliminado`, "success");

        // Recargar horarios
        const updatedResult = await horarioBarbero(barberoSeleccionado.id);
        if (updatedResult) {
          const horariosMap = {};
          (updatedResult.horarios || []).forEach((h) => {
            horariosMap[h.dia_semana] = h;
          });
          setHorarios(horariosMap);
        }
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Error al eliminar horario",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleCopiarHorario = async (diasDestino) => {
    if (!barberoSeleccionado || !horarioOrigenCopy) return;
    setCargando(true);
    let exito = 0;
    let errores = 0;

    for (const dia of diasDestino) {
      if (dia === horarioOrigenCopy.dia) continue;
      try {
        await configurarHorario(barberoSeleccionado.id, {
          dia_semana: dia,
          hora_inicio: horarioOrigenCopy.hora_inicio,
          hora_fin: horarioOrigenCopy.hora_fin,
        });
        exito++;
      } catch (err) {
        errores++;
      }
    }

    if (exito > 0) {
      addToast(`Horario copiado a ${exito} día(s)`, "success");
    }
    if (errores > 0) {
      addToast(`Error en ${errores} día(s)`, "error");
    }

    setCopiarModalOpen(false);
    setHorarioOrigenCopy(null);

    // Recargar horarios
    const updatedResult = await horarioBarbero(barberoSeleccionado.id);
    if (updatedResult) {
      const horariosMap = {};
      (updatedResult.horarios || []).forEach((h) => {
        horariosMap[h.dia_semana] = h;
      });
      setHorarios(horariosMap);
    }
    setCargando(false);
  };

  const abrirModalEditar = (diaId, horarioActual) => {
    setDiaEditando(diaId);
    setHorarioEditando(horarioActual);
    setModalOpen(true);
  };

  const abrirModalCopiar = (diaId, horarioActual) => {
    setHorarioOrigenCopy({
      dia: diaId,
      hora_inicio: horarioActual.hora_inicio,
      hora_fin: horarioActual.hora_fin,
    });
    setCopiarModalOpen(true);
  };

  const handleRecargar = async () => {
    if (barberoSeleccionado) {
      try {
        const result = await horarioBarbero(barberoSeleccionado.id);
        if (result) {
          const horariosMap = {};
          (result.horarios || []).forEach((h) => {
            horariosMap[h.dia_semana] = h;
          });
          setHorarios(horariosMap);
        }
      } catch (err) {
        console.error("Error al recargar horarios:", err);
      }
    }
  };

  if (loading && !inicializado) return <Spinner />;
  if (error && !inicializado)
    return (
      <ErrorBanner message={error} onRetry={() => window.location.reload()} />
    );

  const estadisticas = {
    total: DIAS_SEMANA.length,
    configurados: Object.keys(horarios).length,
    porcentaje: Math.round(
      (Object.keys(horarios).length / DIAS_SEMANA.length) * 100,
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Horarios de Barberos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configura los horarios laborales de cada barbero
          </p>
        </div>
        <button
          onClick={handleRecargar}
          className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          title="Actualizar"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Selector de barbero con búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Seleccionar barbero
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar barbero..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <select
            value={barberoSeleccionado?.id || ""}
            onChange={(e) => {
              const barbero = barberos.find(
                (b) => b.id === parseInt(e.target.value),
              );
              setBarberoSeleccionado(barbero);
            }}
            className="sm:w-64 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Seleccionar barbero</option>
            {barberosFiltrados.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas de horarios */}
      {barberoSeleccionado && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {barberoSeleccionado.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {barberoSeleccionado.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estadisticas.configurados}
                </p>
                <p className="text-xs text-gray-500">Días configurados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {estadisticas.porcentaje}%
                </p>
                <p className="text-xs text-gray-500">Completado</p>
              </div>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${estadisticas.porcentaje}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de horarios por día */}
      {barberoSeleccionado ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DIAS_SEMANA.map((dia) => (
            <DiaHorarioCard
              key={dia.id}
              dia={dia}
              horario={horarios[dia.id]}
              onEdit={() => abrirModalEditar(dia.id, horarios[dia.id])}
              onDelete={() => handleEliminarHorario(dia.id)}
              onCopy={() => abrirModalCopiar(dia.id, horarios[dia.id])}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <User size={32} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Selecciona un barbero
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Elige un barbero del selector para configurar sus horarios
          </p>
        </div>
      )}

      {/* Modal de edición */}
      <HorarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setDiaEditando(null);
          setHorarioEditando(null);
        }}
        onSave={handleGuardarHorario}
        diaSeleccionado={diaEditando}
        horarioActual={horarioEditando}
        cargando={cargando}
      />

      {/* Modal de copiar horario */}
      <CopiarHorarioModal
        isOpen={copiarModalOpen}
        onClose={() => {
          setCopiarModalOpen(false);
          setHorarioOrigenCopy(null);
        }}
        onCopy={handleCopiarHorario}
        diasOrigen={horarioOrigenCopy?.dia}
        cargando={cargando}
      />
    </div>
  );
}
