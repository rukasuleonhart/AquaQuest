import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.3.51:8000",
    timeout: 10000, // Tempo de espera maximo
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptador de respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Erro na requisicao:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
