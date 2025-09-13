import { HistoryItem } from "../context/HistoryContext";

// ---------------------------
// Função para filtrar o histórico de acordo com o período selecionado
// ---------------------------
// Recebe:
// - history: array de ações do usuário
// - viewMode: modo de visualização desejado ("Diário", "Semanal", "Mensal", "Anual")
// Retorna: apenas os itens que se encaixam no período selecionado
export const filterHistory = (history: HistoryItem[], viewMode: "Diário" | "Semanal" | "Mensal" | "Anual") => {
  const now = new Date(); // Data atual para comparar

  // Filtra cada item do histórico
  return history.filter(item => {
    const date = new Date(item.time); // Converte a string do histórico em objeto Date

    switch(viewMode) {
      case "Diário":
        // Retorna apenas ações do mesmo dia
        return date.toDateString() === now.toDateString();

      case "Semanal": {
        // Calcula início da semana (domingo) e fim da semana (sábado)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Subtrai dias até domingo
        weekStart.setHours(0, 0, 0, 0); // início do dia

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Adiciona 6 dias até sábado
        // Retorna apenas ações dentro desta semana
        return date >= weekStart && date <= weekEnd;
      }

      case "Mensal":
        // Retorna apenas ações do mesmo mês e ano
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      case "Anual":
        // Retorna apenas ações do mesmo ano
        return date.getFullYear() === now.getFullYear();

      default:
        // Caso viewMode seja inválido, retorna todos os itens
        return true;
    }
  });
};
