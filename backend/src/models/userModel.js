// src/models/userModel.js
import userRepository from "../repositories/userRepository.js";
import bcrypt from "bcryptjs";

// Exportar funciones del repository para compatibilidad con código existente
export const createUser = (userData) => userRepository.create(userData);
export const findUserByEmail = (email) => userRepository.findByEmail(email);
export const getUserById = (id) => userRepository.findById(id);

// Verificar contraseña (lógica de negocio, no SQL)
export const verifypass = async (plainpass, hashedpass) => {
  return await bcrypt.compare(plainpass, hashedpass);
};

export default {
  createUser,
  findUserByEmail,
  getUserById,
  verifypass,
};
