// utils/historyUtils.ts
export function filterHistory(history: { time: string; amount: number }[], mode: string) {
  const now = new Date();

  switch (mode) {
    case "Diário":
      return history.filter(item => {
        const date = new Date(item.time);
        return date.toDateString() === now.toDateString();
      });

    case "Semanal":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // domingo da semana
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // sábado da semana
      endOfWeek.setHours(23, 59, 59, 999);

      return history.filter(item => {
        const date = new Date(item.time);
        return date >= startOfWeek && date <= endOfWeek;
      });

    case "Mensal":
      return history.filter(item => {
        const date = new Date(item.time);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

    case "Anual":
      return history.filter(item => {
        const date = new Date(item.time);
        return date.getFullYear() === now.getFullYear();
      });

    default:
      return history;
  }
}