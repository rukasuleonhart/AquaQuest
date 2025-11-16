import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.3.51:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptador para adicionar o token a cada requisição
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na requisicao:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
