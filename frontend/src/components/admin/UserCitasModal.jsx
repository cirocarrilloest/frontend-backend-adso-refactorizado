// frontend/src/components/admin/UserCitasModal.jsx
import React, { useState, useEffect } from "react";
import { getCitasDeUsuario } from "../../services/usuarioService";
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
} from "lucide-react";

export const UserCitasModal = ({ isOpen, onClose, userId, userName }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    if (isOpen && userId) {
      cargarCitas();
    }
  }, [isOpen, userId, filter]);

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const estado = filter === "todos" ? null : filter;
      const data = await getCitasDeUsuario(userId, estado);
      setCitas(data.citas);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: { color: "bg-yellow-100 text-yellow-800", icon: PendingIcon },
      confirmada: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      completada: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      cancelada: { color: "bg-red-100 text-red-800", icon: XCircle },
    };
    const { color, icon: Icon } = config[estado] || config.pendiente;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}
      >
        <Icon size={12} /> {estado}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold">Historial de citas - {userName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex gap-2">
            {[
              "todos",
              "pendiente",
              "confirmada",
              "completada",
              "cancelada",
            ].map((est) => (
              <button
                key={est}
                onClick={() => setFilter(est)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  filter === est
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                }`}
              >
                {est}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-4">
          {loading ? (
            <div className="text-center py-10">Cargando citas...</div>
          ) : citas.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No hay citas registradas
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map((cita) => (
                <div
                  key={cita.id}
                  className="border rounded-lg p-4 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold">
                        {cita.servicio_nombre}
                      </span>
                      <div className="text-sm text-gray-500">
                        Barbero: {cita.barbero_nombre}
                      </div>
                    </div>
                    {getEstadoBadge(cita.estado)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />{" "}
                      {new Date(cita.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} /> {cita.hora.substring(0, 5)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} /> ${cita.precio}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
