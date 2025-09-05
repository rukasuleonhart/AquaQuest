import React, { createContext, ReactNode, useContext, useState } from "react";

type HistoryItem = { time: string; amount: number; action: string };

type HistoryContextType = {
  history: HistoryItem[];
  addToHistory: (action: string, amount: number) => void;
  removeFromHistory: (index: number) => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (action: string, amount: number) => {
    const now = new Date();
    const time = now.toISOString(); // <-- salva a data completa
    setHistory((prev) => [{ time, amount, action }, ...prev]);
  };

  const removeFromHistory = (index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context)
    throw new Error("useHistory deve ser usado dentro de HistoryProvider");
  return context;
};
