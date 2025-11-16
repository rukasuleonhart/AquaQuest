import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import api from "../services/api"; // Importa a conexão com o backend

// ---------------------------
// Tipagem de cada item do histórico
// ---------------------------
// Cada registro representa a quantidade de água bebida pelo usuário
export type HistoryItem = { 
  id: number;      // ID único do registro no banco
  time: string;    // Data e hora do registro (em ISO string)
  amount: number;  // Quantidade de água bebida (ml)
};

// ---------------------------
// Tipagem do contexto
// ---------------------------
// Define os dados e funções disponíveis globalmente
type HistoryContextType = {
  history: HistoryItem[];            // Lista de registros
  addToHistory: (amount: number) => void; // Adiciona novo registro
  removeFromHistory: (id: number) => void; // Remove registro pelo ID
};

// ---------------------------
// Criação do contexto
// ---------------------------
// Cria um contexto global para compartilhar os dados
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// ---------------------------
// Provider do contexto
// ---------------------------
// Componente que fornece o histórico para toda a aplicação
export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ---------------------------
  // Buscar histórico no backend ao montar o Provider
  // ---------------------------
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/historico");
        setHistory(response.data); // Espera um array [{id, time, amount}]
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    };

    fetchHistory();
  }, []);

  // ---------------------------
  // Adicionar novo registro
  // ---------------------------
  const addToHistory = async (amount: number) => {
    const newItem = { amount, time: new Date().toISOString() };

    try {
      const response = await api.post("/historico", newItem);
      // Adiciona o item retornado pelo backend no topo da lista
      setHistory(prev => [response.data, ...prev]);
    } catch (error) {
      console.error("Erro ao adicionar histórico:", error);
    }
  };

  // ---------------------------
  // Remover registro pelo ID
  // ---------------------------
  const removeFromHistory = async (id: number) => {
    try {
      await api.delete(`/historico/${id}`);
      // Remove do estado local
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Erro ao remover histórico:", error);
    }
  };

  // ---------------------------
  // Retorna o provider com valores e funções disponíveis globalmente
  // ---------------------------
  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

// ---------------------------
// Hook personalizado para acessar o contexto
// ---------------------------
// Permite usar `useHistory()` em qualquer componente dentro do Provider
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory deve ser usado dentro de HistoryProvider");
  return context;
};
