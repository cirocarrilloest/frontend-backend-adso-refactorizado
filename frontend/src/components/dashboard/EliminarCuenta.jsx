// frontend/src/components/dashboard/EliminarCuenta.jsx
import React, { useState } from "react";
import { Trash2, AlertTriangle, X, ShieldAlert } from "lucide-react";
import { deleteMiCuenta } from "../../services/usuarioService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

function ModalConfirmar({ onClose, onConfirmar, cargando, error }) {
  const [texto, setTexto] = useState("");
  const PALABRA = "ELIMINAR";
  const coincide = texto === PALABRA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-500" />
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <ShieldAlert
                size={20}
                className="text-red-600 dark:text-red-400"
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                Eliminar cuenta
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={cargando}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-4 space-y-2">
            {[
              "Tu cuenta será eliminada de forma permanente",
              "No podrás iniciar sesión ni recuperar tu información",
              "Solo puedes eliminar tu cuenta si no tienes citas pendientes o confirmadas",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300 leading-snug">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Para confirmar, escribe{" "}
              <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                {PALABRA}
              </span>
            </label>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value.toUpperCase())}
              disabled={cargando}
              placeholder={PALABRA}
              autoFocus
              className="w-full border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 disabled:opacity-50 border-gray-200 dark:border-white/10 dark:bg-gray-800 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-red-400 dark:focus:ring-red-500"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={cargando}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={!coincide || cargando}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                  Eliminando…
                </>
              ) : (
                <>
                  <Trash2 size={15} /> Eliminar cuenta
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EliminarCuenta() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const { cerrarSesion } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleEliminar = async () => {
    setCargando(true);
    setError(null);
    try {
      await deleteMiCuenta();
      addToast("Cuenta eliminada exitosamente", "success");
      cerrarSesion();
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
      );
      addToast(
        err.response?.data?.message || "No se pudo eliminar la cuenta",
        "error",
      );
      setCargando(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm">
            Zona de peligro
          </h3>
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Eliminar mi cuenta
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Una vez eliminada, toda tu información desaparecerá de forma
              permanente. Solo puedes eliminarla si no tienes citas activas.
            </p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setModalAbierto(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
          >
            <Trash2 size={15} /> Eliminar cuenta
          </button>
        </div>
      </div>

      {modalAbierto && (
        <ModalConfirmar
          onClose={() => !cargando && setModalAbierto(false)}
          onConfirmar={handleEliminar}
          cargando={cargando}
          error={error}
        />
      )}
    </>
  );
}
