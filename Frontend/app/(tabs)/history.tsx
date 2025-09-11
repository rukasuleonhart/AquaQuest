import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHistory } from "../context/HistoryContext";
import { filterHistory } from "../utils/historyUtils";

export default function WaterConsumptionScreen() {
  const { history, removeFromHistory } = useHistory();

  const [viewMode, setViewMode] = useState<"Hoje" | "Semana" | "Mensal" | "Ano">("Hoje");

  const modeMap = {
    Hoje: "Diário",
    Semana: "Semanal",
    Mensal: "Mensal",
    Ano: "Anual",
  } as const;

  const labels = ["Hoje", "Semana", "Mensal", "Ano"] as const;

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

  const filteredHistory = filterHistory(history, modeMap[viewMode]);
  const totalFiltered = filteredHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico de Consumo de Água</Text>

      {/* Botões com gradiente no ativo */}
      <View style={styles.buttonsRow}>
        {labels.map((label) => {
          const isActive = viewMode === label;

          return isActive ? (
            <LinearGradient
              key={label}
              colors={["#4facfe", "#00f2fe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity
                style={styles.touchableInside}
                onPress={() => setViewMode(label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.viewButtonText, { color: "#fff" }]}>{label}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              key={label}
              style={styles.viewButton}
              onPress={() => setViewMode(label)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewButtonText}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.summaryContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.summaryTitle}>Consumo {viewMode}</Text>

        {/* Total destacado */}
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.totalBox}
        >
          <Text style={styles.totalText}>{totalFiltered} mL</Text>
        </LinearGradient>

        {filteredHistory.length === 0 && (
          <Text style={styles.emptyText}>Nenhum registro ainda</Text>
        )}

        {filteredHistory.map((item, idx) => {
          const date = new Date(item.time);
          const formattedDate = date.toLocaleDateString("pt-BR");
          const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <View key={idx} style={styles.recordItem}>
              {/* Gota com gradiente */}
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="water" size={24} color="#fff" />
              </LinearGradient>

              <View style={styles.recordTextWrapper}>
                <Text style={styles.recordAmount}>{item.amount} mL</Text>
                <Text style={styles.recordDate}>{formattedDate} {formattedTime}</Text>
              </View>

              <TouchableOpacity onPress={() => handleRemove(idx)}>
                <Ionicons name="trash" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9ff", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  gradientButton: {
    borderRadius: 25,
    minWidth: 80,
    elevation: 3,
  },
  touchableInside: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 80,
    borderRadius: 25,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  summaryContainer: { flex: 1 },
  summaryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  totalBox: {
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  totalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic",
    marginBottom: 12,
    textAlign: "center",
  },

  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  recordTextWrapper: { flex: 1, marginLeft: 8 },
  recordAmount: { fontWeight: "bold", fontSize: 16 },
  recordDate: { color: "#555", fontSize: 12 },
});