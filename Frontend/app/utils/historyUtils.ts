// utils/historyUtils.ts

// ---------------------------
// Tipagem do histórico
// ---------------------------
export interface HistoryItem {
  id: number;      // Identificador único do registro
  time: string;    // Data e hora do registro (em formato string)
  amount: number;  // Quantidade de água consumida (em mL)
}

// ---------------------------
// Função de filtragem
// ---------------------------
// Filtra os registros de acordo com o período selecionado: Diário, Semanal, Mensal ou Anual
export function filterHistory(history: HistoryItem[], mode: string): HistoryItem[] {
  const now = new Date(); // Data e hora atual

  switch (mode) {
    case "Diário": // Retorna apenas os registros do dia atual
      return history.filter(item => {
        const date = new Date(item.time); // Converte string para Date
        return date.toDateString() === now.toDateString(); // Compara apenas a data, ignora horário
      });

    case "Semanal": // Retorna os registros da semana atual
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Define domingo como início da semana
      startOfWeek.setHours(0, 0, 0, 0); // Começa à meia-noite

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado como fim da semana
      endOfWeek.setHours(23, 59, 59, 999); // Último instante do dia

      return history.filter(item => {
        const date = new Date(item.time);
        return date >= startOfWeek && date <= endOfWeek; // Verifica se está dentro da semana
      });

    case "Mensal": // Retorna os registros do mês atual
      return history.filter(item => {
        const date = new Date(item.time);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

    case "Anual": // Retorna os registros do ano atual
      return history.filter(item => {
        const date = new Date(item.time);
        return date.getFullYear() === now.getFullYear();
      });

    default: // Se não houver modo válido, retorna todo o histórico
      return history;
  }
}
