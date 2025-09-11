import React, { createContext, ReactNode, useContext, useState } from "react";

// ---------------------------
// Tipagem de cada item do histórico
// ---------------------------
// Cada ação do usuário será registrada como um item no histórico
export type HistoryItem = { 
  time: string;   // Data e hora da ação (em ISO string)
  amount: number; // Quantidade associada à ação (ex: ml de água)
  action: string; // Tipo de ação realizada (ex: "Bebeu")
};

// ---------------------------
// Tipagem do contexto
// ---------------------------
// Define quais dados e funções estarão disponíveis globalmente
type HistoryContextType = {
  history: HistoryItem[]; // Array de ações realizadas
  addToHistory: (action: string, amount: number) => void; // Função para adicionar uma ação
  removeFromHistory: (index: number) => void; // Função para remover uma ação pelo índice
};

// ---------------------------
// Criação do contexto
// ---------------------------
// Contexto global que vai armazenar o histórico
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// ---------------------------
// Provider do contexto
// ---------------------------
// Componente que envolve a aplicação e fornece acesso ao histórico
export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  // Estado local que guarda todas as ações
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ---------------------------
  // Função para adicionar ações ao histórico
  // ---------------------------
  const addToHistory = (action: string, amount: number) => {
    const time = new Date().toISOString(); // Pega o horário atual
    // Adiciona a nova ação no início do array
    setHistory(prev => [{ time, amount, action }, ...prev]);
  };

  // ---------------------------
  // Função para remover uma ação pelo índice
  // ---------------------------
  const removeFromHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index)); // Mantém todos exceto o índice informado
  };

  // ---------------------------
  // Retorna o provider com os valores e funções disponíveis globalmente
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
// Permite usar `useHistory()` em qualquer componente filho do HistoryProvider
export const useHistory = () => {
  const context = useContext(HistoryContext);
  // Garante que o hook seja usado dentro do Provider
  if (!context) throw new Error("useHistory deve ser usado dentro de HistoryProvider");
  return context;
};
