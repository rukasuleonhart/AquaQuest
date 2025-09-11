import React, { createContext, ReactNode, useContext, useState } from "react";

// Tipagem de cada item do histórico
export type HistoryItem = { 
  time: string; 
  amount: number; 
  action: string; 
};

// Tipagem do contexto
type HistoryContextType = {
  history: HistoryItem[];
  addToHistory: (action: string, amount: number) => void;
  removeFromHistory: (index: number) => void;
};

// Cria o contexto
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (action: string, amount: number) => {
    const time = new Date().toISOString();
    setHistory(prev => [{ time, amount, action }, ...prev]);
  };

  const removeFromHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory deve ser usado dentro de HistoryProvider");
  return context;
};
