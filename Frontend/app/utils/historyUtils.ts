import { HistoryItem } from "../context/HistoryContext";

export const filterHistory = (history: HistoryItem[], viewMode: "Diário" | "Semanal" | "Mensal" | "Anual") => {
  const now = new Date();

  return history.filter(item => {
    const date = new Date(item.time);

    switch(viewMode) {
      case "Diário":
        return date.toDateString() === now.toDateString();
      case "Semanal": {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return date >= weekStart && date <= weekEnd;
      }
      case "Mensal":
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case "Anual":
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
};
