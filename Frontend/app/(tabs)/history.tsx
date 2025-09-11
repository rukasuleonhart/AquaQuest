import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHistory } from "../context/HistoryContext";
import { filterHistory } from "../utils/historyUtils";

export default function WaterConsumptionScreen() {
  const { history, removeFromHistory } = useHistory();

  // UI: nomes amigáveis
  const [viewMode, setViewMode] = useState<"Hoje" | "Semana" | "Mensal" | "Ano">("Hoje");

  // Mapeamento para nomes esperados pela função filterHistory
  const modeMap = {
    Hoje: "Diário",
    Semana: "Semanal",
    Mensal: "Mensal",
    Ano: "Anual"
  } as const;

  // Labels do menu com tipagem literal
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

  // Passa o valor mapeado para filterHistory
  const filteredHistory = filterHistory(history, modeMap[viewMode]);
  const totalFiltered = filteredHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico de Consumo de Água</Text>

      {/* Botões de visualização */}
      <View style={styles.buttonsRow}>
        {labels.map(label => (
          <TouchableOpacity
            key={label}
            style={[
              styles.viewButton,
              viewMode === label && { backgroundColor: "#4a90e2" }
            ]}
            onPress={() => setViewMode(label)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === label && { color: "#fff" }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Consumo {viewMode}</Text>
        <Text style={styles.summaryTotal}>{totalFiltered} mL</Text>

        {filteredHistory.length === 0 && (
          <Text style={{ color: "#555", marginBottom: 12 }}>Nenhum registro ainda</Text>
        )}

        {filteredHistory.map((item, idx) => {
          const date = new Date(item.time);
          const formattedDate = date.toLocaleDateString("pt-BR");
          const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <View key={idx} style={styles.recordItem}>
              <Ionicons name="water" size={24} color="#4a90e2" />
              <Text style={styles.recordText}>
                {item.amount} mL - {formattedDate} {formattedTime}
              </Text>
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

  // Linha de botões
  buttonsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 16,
    gap: 8 // espaço entre botões
  },
  viewButton: { 
    paddingVertical: 12,      // mais altura
    paddingHorizontal: 20,    // mais largura
    minWidth: 80,             // largura mínima
    borderRadius: 25,         // mais arredondado
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
    color: "#333" 
  },

  summaryContainer: { flex: 1 },
  summaryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  summaryTotal: { fontSize: 16, marginBottom: 12 },
  recordItem: { flexDirection: "row", alignItems: "center", marginBottom: 8, backgroundColor: "#fff", padding: 8, borderRadius: 8 },
  recordText: { flex: 1, marginLeft: 8 },
});
