import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHistory } from "../components/HistoryContext";

export default function HistoryScreen() {
  const { history, removeFromHistory } = useHistory();

  const totals = useMemo(() => {
    const now = new Date();
    let dayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;

    history.forEach(item => {
      const itemDate = new Date(item.time);

      // Totais
      if (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      ) dayTotal += item.amount;

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      if (itemDate >= startOfWeek && itemDate <= endOfWeek) weekTotal += item.amount;

      if (itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth())
        monthTotal += item.amount;
    });

    return { dayTotal, weekTotal, monthTotal };
  }, [history]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Hidratação</Text>

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

      <FlatList
        data={history}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.action}>{item.action}</Text>
              <Text style={styles.amount}>{item.amount} mL</Text>
            </View>
            <Text style={styles.time}>{new Date(item.time).toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeFromHistory(index)}
            >
              <Text style={styles.deleteButtonText}>Apagar</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F6FF", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A73E8", textAlign: "center", marginBottom: 20 },

  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    elevation: 2,
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
