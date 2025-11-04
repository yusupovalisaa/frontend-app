import axios from "axios";
import { CONFIG } from "../utils/constants";

// Создаем экземпляр axios с перехватчиком ошибок
const api = axios.create({
  baseURL: CONFIG.BASE_API_URL,
  withCredentials: true,
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Сервер ответил с ошибкой (4xx, 5xx)
      const message = error.response.data?.detail || `Ошибка ${error.response.status}`;
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      return Promise.reject(new Error("Ошибка подключения к серверу"));
    } else {
      // Что-то пошло не так при настройке запроса
      return Promise.reject(new Error("Ошибка при выполнении запроса"));
    }
  }
);

export const authApi = {
  register: async (data: { role: string; surname: string; name: string; patronymic?: string }) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },
  login: async (data: { username: string }) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },
  verify: async (data: { username: string; token: string }) => {
    const res = await api.post("/auth/login/verify", data);
    return res.data;
  },
};