// frontend/src/components/Ingreso.jsx

import React, { useState } from "react";
import { ingresar } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { validarEmail, validarPassword } from "../utils/validaciones";

export const Ingreso = ({ onSwitch }) => {
  const [form, setForm] = useState({ email: "", pass: "" });
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});
  const [cargando, setCargando] = useState(false);

  const { guardarSesion } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (erroresCampos[e.target.name]) {
      setErroresCampos({ ...erroresCampos, [e.target.name]: "" });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const errorEmail = validarEmail(form.email);
    if (errorEmail) nuevosErrores.email = errorEmail;

    const errorPass = validarPassword(form.pass);
    if (errorPass) nuevosErrores.pass = errorPass;

    setErroresCampos(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validarFormulario()) return;

    setCargando(true);
    try {
      const data = await ingresar(form);
      guardarSesion(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      let mensajeError = "Error al iniciar sesión";

      if (err.response?.status === 401) {
        mensajeError = "Email o contraseña incorrectos";
      } else if (err.response?.data?.message) {
        mensajeError = err.response.data.message;
      } else if (err.message) {
        mensajeError = err.message;
      }

      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !cargando) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg w-80">
      <h2 className="text-2xl font-bold">Iniciar Sesión</h2>

      {error && (
        <p className="text-red-500 text-sm text-center w-full">{error}</p>
      )}

      <div className="w-full">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            erroresCampos.email ? "border-red-500" : "border-gray-300"
          }`}
        />
        {erroresCampos.email && (
          <p className="text-red-500 text-xs mt-1">{erroresCampos.email}</p>
        )}
      </div>

      <div className="w-full">
        <input
          type="password"
          name="pass"
          placeholder="Contraseña"
          value={form.pass}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            erroresCampos.pass ? "border-red-500" : "border-gray-300"
          }`}
        />
        {erroresCampos.pass && (
          <p className="text-red-500 text-xs mt-1">{erroresCampos.pass}</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={cargando}
        className="w-full bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800 transition disabled:opacity-50"
      >
        {cargando ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Ingresando...
          </span>
        ) : (
          "Ingresar"
        )}
      </button>

      <p className="text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <button
          onClick={onSwitch}
          className="text-blue-600 hover:underline font-semibold"
        >
          Regístrate
        </button>
      </p>
    </div>
  );
};

export default Ingreso;
