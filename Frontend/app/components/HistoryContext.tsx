import React, { createContext, ReactNode, useContext, useState } from "react";

// Tipagem de cada item do histórico
// - time: data/hora em ISO string
// - amount: quantidade (ex: mL de água)
// - action: ação realizada (ex: "Bebeu" ou "Encheu")
type HistoryItem = { 
  time: string; 
  amount: number; 
  action: string; 
};

// Tipagem do contexto, definindo funções disponíveis
type HistoryContextType = {
  history: HistoryItem[]; // histórico completo
  addToHistory: (action: string, amount: number) => void; // adiciona item
  removeFromHistory: (index: number) => void; // remove item pelo índice
};

// Cria o contexto (inicialmente indefinido)
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

/**
 * Provider do contexto de histórico
 * Envolve toda a aplicação onde o histórico será usado.
 */
export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]); // estado interno do histórico

  /**
   * Adiciona um item ao histórico
   * @param action - ação realizada (ex: "Bebeu")
   * @param amount - quantidade consumida (ex: 250 mL)
   */
  const addToHistory = (action: string, amount: number) => {
    const now = new Date();
    const time = now.toISOString(); // salva data completa em formato ISO
    // adiciona novo item no início do array
    setHistory((prev) => [{ time, amount, action }, ...prev]);
  };

  /**
   * Remove um item do histórico pelo índice
   * @param index - posição do item a ser removido
   */
  const removeFromHistory = (index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

/**
 * Hook para consumir o contexto de histórico
 * @returns {HistoryContextType} funções e estado do histórico
 * @throws Erro se usado fora do HistoryProvider
 */
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context)
    throw new Error("useHistory deve ser usado dentro de HistoryProvider");
  return context;
};
