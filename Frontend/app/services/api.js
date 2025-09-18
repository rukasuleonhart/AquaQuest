import axios from "axios"; // Importa a biblioteca Axios, usada para fazer requisições HTTP

// ---------------------------
// Configuração da API
// ---------------------------
const api = axios.create({
    baseURL: "http://192.168.3.51:8000", // Endereço base do backend (todas as requisições usarão isso)
    timeout: 10000, // Tempo máximo de espera por uma resposta (10 segundos)
    headers: {
        "Content-Type": "application/json", // Indica que os dados enviados e recebidos são em JSON
    },
});

// ---------------------------
// Interceptador de respostas
// ---------------------------
// Permite "interceptar" respostas de todas as requisições
api.interceptors.response.use(
    (response) => response, // Se a requisição for bem-sucedida, apenas retorna a resposta
    (error) => {
        // Se houver erro, mostra no console
        console.error("Erro na requisicao:", error.response?.data || error.message);
        return Promise.reject(error); // Rejeita a promessa para que o erro possa ser tratado onde a requisição foi chamada
    }
);

export default api; // Exporta a instância configurada do Axios para ser usada em outros arquivos
