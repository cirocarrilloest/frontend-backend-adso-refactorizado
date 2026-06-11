// frontend/src/components/dashboard/AdminCrearCita.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Scissors,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getUsuarios } from "../../services/usuarioService";
import { getServicios } from "../../services/servicioService";
import { getBarberos } from "../../services/usuarioService";
import {
  crearCitaAdmin,
  getHorariosDisponibles,
} from "../../services/citaService";

function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <RefreshCw size={20} className="animate-spin text-amber-400" />
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      <AlertCircle size={16} /> {msg}
    </div>
  );
}

export const AdminCrearCita = ({ onCitaCreada }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    cliente: null,
    barbero: null,
    servicio: null,
    fecha: "",
    hora: "",
    notas: "",
  });

  // Listas para selects
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Búsqueda de clientes
  const [searchCliente, setSearchCliente] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [barberosRes, serviciosRes] = await Promise.all([
          getBarberos(),
          getServicios(true),
        ]);
        setBarberos(barberosRes.barberos || []);
        setServicios(serviciosRes.servicios || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Buscar clientes por nombre o email
  const buscarClientes = useCallback(async (termino) => {
    if (!termino || termino.length < 2) {
      setClientes([]);
      return;
    }
    setLoadingClientes(true);
    try {
      const res = await getUsuarios({ rol: "cliente", search: termino });
      setClientes(res.usuarios || []);
      setShowClienteDropdown(true);
    } catch (err) {
      console.error("Error buscando clientes:", err);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Debounce para búsqueda de clientes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchCliente) {
        buscarClientes(searchCliente);
      } else {
        setClientes([]);
        setShowClienteDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchCliente, buscarClientes]);

  // Cargar horarios cuando cambia barbero o fecha
  useEffect(() => {
    const cargarHorarios = async () => {
      if (formData.barbero && formData.fecha) {
        setLoading(true);
        try {
          const res = await getHorariosDisponibles(
            formData.barbero.id,
            formData.fecha,
          );
          setHorariosDisponibles(res.horarios_disponibles || []);
        } catch (err) {
          setHorariosDisponibles([]);
        } finally {
          setLoading(false);
        }
      }
    };
    cargarHorarios();
  }, [formData.barbero, formData.fecha]);

  const handleSubmit = async () => {
    if (
      !formData.cliente ||
      !formData.barbero ||
      !formData.servicio ||
      !formData.fecha ||
      !formData.hora
    ) {
      setError("Completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await crearCitaAdmin({
        cliente_id: formData.cliente.id,
        barbero_id: formData.barbero.id,
        servicio_id: formData.servicio.id,
        fecha: formData.fecha,
        hora: formData.hora,
        notas: formData.notas,
      });
      setSuccess("Cita creada exitosamente");
      setFormData({
        cliente: null,
        barbero: null,
        servicio: null,
        fecha: "",
        hora: "",
        notas: "",
      });
      setSearchCliente("");
      setStep(1);
      if (onCitaCreada) onCitaCreada();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear cita");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    setFormData({ ...formData, cliente });
    setSearchCliente(cliente.nombre);
    setShowClienteDropdown(false);
    setStep(2);
  };

  const steps = [
    { num: 1, label: "Cliente", icon: User },
    { num: 2, label: "Servicio", icon: Scissors },
    { num: 3, label: "Barbero", icon: User },
    { num: 4, label: "Fecha/Hora", icon: Calendar },
    { num: 5, label: "Confirmar", icon: CheckCircle },
  ];

  if (loading && !formData.cliente) {
    return <Spinner />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s.num
                      ? "bg-amber-400 text-gray-900"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle size={18} />
                  ) : (
                    <s.icon size={18} />
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-500 hidden sm:block">
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step > s.num
                      ? "bg-amber-400"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
        {error && <ErrorBanner msg={error} />}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-4">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* STEP 1: Buscar Cliente */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Buscar cliente
            </h3>
            <p className="text-sm text-gray-500">
              Busca por nombre o correo electrónico
            </p>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                onFocus={() => searchCliente && setShowClienteDropdown(true)}
                placeholder="Escribe nombre o email..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {loadingClientes && (
              <div className="flex justify-center py-4">
                <RefreshCw size={20} className="animate-spin text-amber-400" />
              </div>
            )}

            {showClienteDropdown && clientes.length > 0 && (
              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {clientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-white/5 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        {cliente.nombre?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {cliente.nombre}
                      </p>
                      <p className="text-xs text-gray-400">{cliente.email}</p>
                    </div>
                    {cliente.telefono && (
                      <p className="text-xs text-gray-400">
                        {cliente.telefono}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showClienteDropdown &&
              searchCliente &&
              clientes.length === 0 &&
              !loadingClientes && (
                <div className="text-center py-8 text-gray-400">
                  No se encontraron clientes con "{searchCliente}"
                </div>
              )}
          </div>
        )}

        {/* STEP 2: Seleccionar Servicio */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seleccionar servicio
              </h3>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-amber-500 hover:text-amber-600"
              >
                ← Cambiar cliente
              </button>
            </div>

            <div className="space-y-2">
              {servicios.map((servicio) => (
                <button
                  key={servicio.id}
                  onClick={() => {
                    setFormData({ ...formData, servicio });
                    setStep(3);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    formData.servicio?.id === servicio.id
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                      : "border-gray-200 dark:border-white/10 hover:border-amber-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {servicio.nombre}
                      </p>
                      {servicio.descripcion && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {servicio.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        ${servicio.precio}
                      </p>
                      <p className="text-xs text-gray-400">
                        {servicio.duracion} min
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Seleccionar Barbero */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seleccionar barbero
              </h3>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-amber-500 hover:text-amber-600"
              >
                ← Cambiar servicio
              </button>
            </div>

            <div className="space-y-2">
              {barberos.map((barbero) => (
                <button
                  key={barbero.id}
                  onClick={() => {
                    setFormData({ ...formData, barbero });
                    setStep(4);
                  }}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-amber-300 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      {barbero.nombre?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {barbero.nombre}
                    </p>
                    {barbero.email && (
                      <p className="text-xs text-gray-400">{barbero.email}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Fecha y Hora */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fecha y hora
              </h3>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-amber-500 hover:text-amber-600"
              >
                ← Cambiar barbero
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value, hora: "" })
                }
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700"
              />
            </div>

            {formData.fecha && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hora disponible
                </label>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-amber-400"
                    />
                  </div>
                ) : horariosDisponibles.length === 0 ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400 py-2">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {horariosDisponibles.map((hora) => (
                      <button
                        key={hora}
                        onClick={() => setFormData({ ...formData, hora })}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                          formData.hora === hora
                            ? "bg-amber-400 border-amber-400 text-gray-900"
                            : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-amber-300"
                        }`}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm dark:bg-gray-700"
                placeholder="Instrucciones especiales..."
              />
            </div>

            <button
              onClick={() => setStep(5)}
              disabled={!formData.fecha || !formData.hora}
              className="w-full bg-amber-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 5: Confirmar */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar cita
              </h3>
              <button
                onClick={() => setStep(4)}
                className="text-sm text-amber-500 hover:text-amber-600"
              >
                ← Cambiar fecha
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cliente</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.cliente?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Servicio</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.servicio?.nombre} · ${formData.servicio?.precio}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Barbero</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.barbero?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Fecha y hora</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.fecha} · {formData.hora}
                </span>
              </div>
              {formData.notas && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Notas</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formData.notas}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Creando cita..." : "Confirmar y crear cita"}
            </button>
          </div>
        )}
      </div>

      {/* Resumen del cliente seleccionado */}
      {formData.cliente && step > 1 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Cliente: <strong>{formData.cliente.nombre}</strong> (
            {formData.cliente.email})
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCrearCita;
