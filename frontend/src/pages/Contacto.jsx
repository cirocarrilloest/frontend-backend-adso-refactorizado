// src/pages/Contacto.jsx
import React from "react";
import ContactoInfo from "../components/ContactoInfo.jsx";
import ContactoFormulario from "../components/ContactoFormulario.jsx";

export const Contacto = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full px-6 p-17.5">
      <div className="max-w-md">
        <ContactoInfo />
      </div>

      <div className="w-full max-w-md">
        <ContactoFormulario />
      </div>
    </div>
  );
};

export default Contacto;
