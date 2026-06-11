// src/models/configModel.js
/**
 * configModel.js — Alias de compatibilidad
 */

import { configRepository } from "../repositories/configRepository.js";

export const getAllConfig = () => configRepository.getAll();

export const getConfigByKey = (clave) => configRepository.getByKey(clave);

export const setConfig = (clave, valor) => configRepository.set(clave, valor);

export const setManyConfig = (pares) => configRepository.setMany(pares);

export default {
  getAllConfig,
  getConfigByKey,
  setConfig,
  setManyConfig,
};
