import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHistory } from "../context/HistoryContext"; // ajuste o caminho conforme seu projeto

export default function WaterConsumptionScreen() {
  const { history, removeFromHistory } = useHistory();

  const handleRemove = (index: number) => {
    Alert.alert(
      "Remover registro",
      "Tem certeza que deseja remover este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removeFromHistory(index) },
      ]
    );
  };

  // Calcula total do dia
  const totalToday = history.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Histórico de Consumo de Água</Text>

      {/* View Buttons */}
      <View style={styles.buttonsRow}>
        {["Diário", "Semanal", "Mensal", "Anual"].map((label) => (
          <TouchableOpacity key={label} style={styles.viewButton}>
            <Text style={styles.viewButtonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation Row */}
      <View style={styles.navigationRow}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-back" size={32} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.currentDateText}>{new Date().toLocaleDateString()}</Text>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-forward" size={32} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      {/* Summary / Records */}
      <ScrollView style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Consumo em {new Date().toLocaleDateString()}</Text>
        <Text style={styles.summaryTotal}>{totalToday} mL</Text>

        {history.length === 0 && <Text style={{ color: "#555", marginBottom: 12 }}>Nenhum registro ainda</Text>}

        {/* Histórico real */}
        {history.map((item, idx) => (
          <View key={idx} style={styles.recordItem}>
            <Ionicons name="water" size={24} color="#4a90e2" />
            <Text style={styles.recordText}>
              {item.amount} mL - {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            <TouchableOpacity onPress={() => handleRemove(idx)}>
              <Ionicons name="trash" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Mock Chart Placeholder */}
        <View style={styles.chartPlaceholder}>
          <Text style={{ color: "#555" }}>Gráfico Aqui</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9ff", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  viewButton: { padding: 8, borderRadius: 8, backgroundColor: "#ddd" },
  viewButtonText: { fontSize: 14, fontWeight: "bold" },
  navigationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navButton: { padding: 8 },
  currentDateText: { fontSize: 16, fontWeight: "bold" },
  summaryContainer: { flex: 1 },
  summaryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  summaryTotal: { fontSize: 16, marginBottom: 12 },
  recordItem: { flexDirection: "row", alignItems: "center", marginBottom: 8, backgroundColor: "#fff", padding: 8, borderRadius: 8 },
  recordText: { flex: 1, marginLeft: 8 },
  chartPlaceholder: { height: 220, backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center", borderRadius: 12, marginVertical: 16 },
});
