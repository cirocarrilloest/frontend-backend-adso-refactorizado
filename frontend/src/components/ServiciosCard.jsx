// src/components/ServiciosCard.jsx
import React from "react";
import img1 from "../assets/img1.jpg";
import img4 from "../assets/img4.jpg";
import img3 from "../assets/img3.jpg";
const ServiciosCardData = [
  {
    id: 1,
    title: "Cuidado del cabello",
    description: (
      <ul className="space-y-1">
        <li>corte de cabello</li>
        <li>arreglo de barba</li>
        <li>afeitado</li>
        <li>tratamiento capilares</li>
        <li>tinte de cabello y barba</li>
        <li>alizado de cabello</li>
      </ul>
    ),
    image: (
      <img
        src={img1}
        alt="corte"
        className="w-full h-full object-cover rounded-lg"
      />
    ),
    bgColor: "bg-blue-500",
  },
  {
    id: 2,
    title: "cuidado facial",
    description: (
      <ul className="space-y-1">
        <li>afeitado con ritual</li>
        <li>tratamientos faciales</li>
        <li>masajes faciales</li>
      </ul>
    ),
    image: (
      <img
        src={img4}
        alt="corte"
        className="w-full h-full object-cover rounded-lg"
      />
    ),
    bgColor: "bg-green-500",
  },
  {
    id: 3,
    title: "otros servicios",
    description: (
      <ul>
        <li>asesoramiento</li>
        <li>paquete de servicios</li>
        <li>manicure y pedicure</li>
      </ul>
    ),
    image: (
      <img
        src={img3}
        alt="corte"
        className="w-full h-full object-cover rounded-lg"
      />
    ),
    bgColor: "bg-yellow-500",
  },
];

export const ServiciosCard = () => {
  return (
    <div className="py-5">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ServiciosCardData.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition w-full"
            >
              {/* Icono */}
              <div
                className={`w-full h-52 sm:h-56 md:h-60 ${item.bgColor} rounded-lg overflow-hidden flex items-center justify-center`}
              >
                {item.image}
              </div>

              {/* Texto */}
              <div className="mt-4 space-y-2">
                <h2 className="font-semibold text-xl">{item.title}</h2>

                <div className="text-gray-500 text-sm">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiciosCard;
