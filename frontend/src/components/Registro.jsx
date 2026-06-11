// Frontend/src/components/Registro.jsx
import React, { useState } from "react";
import { registrar } from "../services/authService";

export const Registro = ({ onSwitch }) => {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    pass: "",
    confirmarPass: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const [erroresCampos, setErroresCampos] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar error del campo cuando el usuario escribe
    if (erroresCampos[e.target.name]) {
      setErroresCampos({ ...erroresCampos, [e.target.name]: "" });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido";
    } else if (form.nombre.length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!form.email.trim()) {
      nuevosErrores.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nuevosErrores.email = "El email no es válido";
    }

    if (!form.pass) {
      nuevosErrores.pass = "La contraseña es requerida";
    } else if (form.pass.length < 6) {
      nuevosErrores.pass = "La contraseña debe tener al menos 6 caracteres";
    }

    if (form.pass !== form.confirmarPass) {
      nuevosErrores.confirmarPass = "Las contraseñas no coinciden";
    }

    if (form.telefono && !/^[0-9+\-\s()]+$/.test(form.telefono)) {
      nuevosErrores.telefono = "El teléfono contiene caracteres no válidos";
    }

    setErroresCampos(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    setError("");
    setExito("");

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    try {
      const data = await registrar({
        nombre: form.nombre,
        email: form.email,
        pass: form.pass,
        telefono: form.telefono || null,
      });

      setExito("¡Cuenta creada! Ya puedes iniciar sesión.");

      // Limpiar formulario
      setForm({
        nombre: "",
        telefono: "",
        email: "",
        pass: "",
        confirmarPass: "",
      });

      setTimeout(() => {
        if (onSwitch) onSwitch();
      }, 1500);
    } catch (err) {
      const mensajeError =
        err.response?.data?.message ||
        err.message ||
        "Error al registrar usuario";
      if (
        mensajeError.includes("email") ||
        mensajeError.includes("duplicado")
      ) {
        setError("Este correo electrónico ya está registrado");
      } else {
        setError(mensajeError);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold">Crear Cuenta</h2>

      {error && (
        <p className="text-red-500 text-sm text-center w-full">{error}</p>
      )}
      {exito && (
        <p className="text-green-600 text-sm text-center w-full">{exito}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo *"
            value={form.nombre}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              erroresCampos.nombre ? "border-red-500" : "border-gray-300"
            }`}
          />
          {erroresCampos.nombre && (
            <p className="text-red-500 text-xs mt-1">{erroresCampos.nombre}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="telefono"
            placeholder="Número de teléfono"
            value={form.telefono}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              erroresCampos.telefono ? "border-red-500" : "border-gray-300"
            }`}
          />
          {erroresCampos.telefono && (
            <p className="text-red-500 text-xs mt-1">
              {erroresCampos.telefono}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico *"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              erroresCampos.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {erroresCampos.email && (
            <p className="text-red-500 text-xs mt-1">{erroresCampos.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="pass"
            placeholder="Contraseña *"
            value={form.pass}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              erroresCampos.pass ? "border-red-500" : "border-gray-300"
            }`}
          />
          {erroresCampos.pass && (
            <p className="text-red-500 text-xs mt-1">{erroresCampos.pass}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="confirmarPass"
            placeholder="Confirmar contraseña *"
            value={form.confirmarPass}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              erroresCampos.confirmarPass ? "border-red-500" : "border-gray-300"
            }`}
          />
          {erroresCampos.confirmarPass && (
            <p className="text-red-500 text-xs mt-1">
              {erroresCampos.confirmarPass}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={cargando}
        className="w-full bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800 transition disabled:opacity-50"
      >
        {cargando ? "Registrando..." : "Registrarse"}
      </button>

      <p className="text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={onSwitch}
          className="text-blue-600 hover:underline font-semibold"
        >
          Inicia sesión
        </button>
      </p>
    </div>
  );
};

export default Registro;
