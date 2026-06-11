// src/components/contactoInfo.jsx
import React from "react";
import { CiMail } from "react-icons/ci";
import { FaPhone } from "react-icons/fa";

export const ContactoInfo = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-white">
        Información de Contacto
      </h2>

      <p className="text-white">
        Si tienes alguna consulta o necesitas más información, puedes
        escribirnos a través del formulario o contactarnos directamente.
      </p>

      <div className="flex items-center gap-2 text-white">
        <CiMail />
        <span>barber@barbershop.com</span>
      </div>

      <div className="flex items-center gap-2 text-white">
        <FaPhone />
        <span>(123) 456-7890</span>
      </div>
    </div>
  );
};

export default ContactoInfo;
