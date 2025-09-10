import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Importa o hook useHistory para acessar o contexto de histórico (criado no HistoryContext)
import { useHistory } from "../components/HistoryContext";

/**
 * Componente que exibe o histórico de hidratação do usuário.
 * Mostra totais de consumo diário, semanal e mensal e lista cada registro com opção de remoção.
 */
export default function HistoryScreen() {
  // Desestrutura os dados e funções do contexto de histórico
  const { history, removeFromHistory } = useHistory();

  /**
   * useMemo é usado para calcular os totais apenas quando 'history' muda,
   * evitando cálculos desnecessários em cada renderização.
   */
  const totals = useMemo(() => {
    const now = new Date(); // Data atual
    let dayTotal = 0;       // Total do dia
    let weekTotal = 0;      // Total da semana
    let monthTotal = 0;     // Total do mês

    history.forEach(item => {
      const itemDate = new Date(item.time); // Converte a data do registro em objeto Date

      // Soma diária
      if (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      ) dayTotal += item.amount;

      // Soma semanal
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Início da semana (domingo)
      startOfWeek.setHours(0, 0, 0, 0);                // Zera hora/minuto/segundo
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);    // Fim da semana (sábado)
      endOfWeek.setHours(23, 59, 59, 999);
      if (itemDate >= startOfWeek && itemDate <= endOfWeek) weekTotal += item.amount;

      // Soma mensal
      if (itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth())
        monthTotal += item.amount;
    });

    return { dayTotal, weekTotal, monthTotal };
  }, [history]); // Recalcula apenas quando 'history' muda

  return (
    <View style={styles.container}>
      {/* Título da tela */}
      <Text style={styles.title}>Histórico de Hidratação</Text>

      {/* Cards com totais diário, semanal e mensal */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Hoje</Text>
          <Text style={styles.totalValue}>{totals.dayTotal} mL</Text>
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Semana</Text>
          <Text style={styles.totalValue}>{totals.weekTotal} mL</Text>
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Mês</Text>
          <Text style={styles.totalValue}>{totals.monthTotal} mL</Text>
        </View>
      </View>

      {/* Lista de histórico */}
      <FlatList
        data={history} // Array de registros de hidratação
        keyExtractor={(_, i) => i.toString()} // Chave única para cada item
        contentContainerStyle={{ paddingBottom: 30 }} // Espaço extra no final da lista
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Linha com ação e quantidade */}
            <View style={styles.cardRow}>
              <Text style={styles.action}>{item.action}</Text>
              <Text style={styles.amount}>{item.amount} mL</Text>
            </View>
            {/* Data e hora do registro */}
            <Text style={styles.time}>{new Date(item.time).toLocaleString()}</Text>
            {/* Botão para remover registro */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeFromHistory(index)}
            >
              <Text style={styles.deleteButtonText}>Apagar</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // Espaço entre cards
      />
    </View>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F6FF", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A73E8", textAlign: "center", marginBottom: 20 },

  totalsContainer: {
    flexDirection: "row",           // Coloca os cards lado a lado
    justifyContent: "space-between",// Espaço igual entre os cards
    marginBottom: 25,
  },
  totalCard: {
    flex: 1,
    backgroundColor: "#E3F2FF",
    marginHorizontal: 5,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2, // Para sombra no Android
  },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#007AFF", marginBottom: 6 },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "#005BBB" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  action: { fontSize: 17, fontWeight: "600", color: "#1A73E8" },
  amount: { fontSize: 17, fontWeight: "bold", color: "#00A2FF" },
  time: { fontSize: 13, color: "#888", marginBottom: 10 },
  deleteButton: { alignSelf: "flex-end", backgroundColor: "#FF4C4C", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10 },
  deleteButtonText: { color: "white", fontWeight: "bold" },
});
