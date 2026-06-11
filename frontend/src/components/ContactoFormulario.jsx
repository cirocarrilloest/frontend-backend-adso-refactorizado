// frontend/src/components/ContactoFormulario.jsx
import React, { useState } from "react";
import api from "../services/axiosConfig";

export const ContactoFormulario = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "El email no es válido";
    if (!formData.message.trim()) newErrors.message = "El mensaje es requerido";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      // Llamar al backend (endpoint a crear)
      await api.post("/contacto", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Error al enviar mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md gap-3 bg-white shadow-lg p-5 rounded-md"
      >
        <h2 className="text-2xl font-semibold">Formulario de Contacto</h2>

        {success && (
          <p className="text-green-600">Mensaje enviado correctamente ✅</p>
        )}
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}

        <input
          type="text"
          name="name"
          placeholder="Tu nombre"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="text-red-500">{errors.name}</span>}

        <input
          type="email"
          name="email"
          placeholder="Tu email"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="text-red-500">{errors.email}</span>}

        <textarea
          name="message"
          placeholder="Tu mensaje"
          rows="4"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && (
          <span className="text-red-500">{errors.message}</span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-700 text-white rounded-lg py-2 hover:bg-blue-800 transition"
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};

export default ContactoFormulario;
