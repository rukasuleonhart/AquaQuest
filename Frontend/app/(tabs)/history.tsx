// ---------------------------
// Importações de bibliotecas externas
// ---------------------------
import { Ionicons } from "@expo/vector-icons"; // Ícones prontos do Expo
import { LinearGradient } from "expo-linear-gradient"; // Gradientes de cor
import React, { useState } from "react"; // React e hook de estado
import {
  Alert, // Caixa de alerta para confirmar ações
  Platform, // Detecta se é web ou mobile
  ScrollView, // Container com rolagem
  StyleSheet, // Para criar estilos
  Text, // Componente de texto
  TouchableOpacity, // Botão clicável
  View, // Container genérico
} from "react-native";

// ---------------------------
// Importações de contexto e utilitários
// ---------------------------
import { useHistory } from "../context/HistoryContext"; // Hook para acessar histórico global
import { filterHistory } from "../utils/historyUtils"; // Função para filtrar histórico por período

// ---------------------------
// Tipagem do histórico
// ---------------------------
interface HistoryItem {
  id: number; // Identificador único do registro
  amount: number; // Quantidade de água consumida
  time: string; // Momento do registro (pode ser Date)
}

// ---------------------------
// Componente principal da tela de consumo de água
// ---------------------------
export default function WaterConsumptionScreen() {
  // Pega o histórico e função para remover registros do contexto global
  const { history, removeFromHistory } = useHistory() as {
    history: HistoryItem[];
    removeFromHistory: (id: number) => void;
  };

  // Estado para controlar qual período de visualização está ativo
  const [viewMode, setViewMode] = useState<"Hoje" | "Semana" | "Mensal" | "Ano">("Hoje");

  // Mapeia os rótulos para o tipo de filtragem
  const modeMap = {
    Hoje: "Diário",
    Semana: "Semanal",
    Mensal: "Mensal",
    Ano: "Anual",
  } as const;

  const labels = ["Hoje", "Semana", "Mensal", "Ano"] as const;

  // ---------------------------
  // Função que confirma remoção de um registro
  // ---------------------------
  const handleRemove = (id: number) => {
    if (Platform.OS === "web") { // Se estiver rodando no navegador
      const confirmDelete = window.confirm("Tem certeza que deseja remover este registro?");
      if (confirmDelete) removeFromHistory(id);
    } else { // Se estiver em celular
      Alert.alert("Remover registro", "Tem certeza que deseja remover este registro?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removeFromHistory(id) },
      ]);
    }
  };

  // Filtra o histórico de acordo com o período selecionado
  const filteredHistory: HistoryItem[] = filterHistory(history, modeMap[viewMode]);

  // Soma total do consumo filtrado
  const totalFiltered = filteredHistory.reduce((sum, item) => sum + item.amount, 0);

  // ---------------------------
  // JSX da tela
  // ---------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico de Consumo de Água</Text>

      {/* Botões de seleção de período */}
      <View style={styles.buttonsRow}>
        {labels.map((label) => {
          const isActive = viewMode === label; // Verifica se o botão está ativo

          // Botão ativo com gradiente
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
                onPress={() => setViewMode(label)} // Altera o período ao clicar
                activeOpacity={0.8}
              >
                <Text style={[styles.viewButtonText, { color: "#fff" }]}>{label}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            // Botão inativo simples
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

      {/* Resumo e histórico */}
      <ScrollView style={styles.summaryContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.summaryTitle}>Consumo {viewMode}</Text>

        {/* Caixa mostrando o total de consumo */}
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.totalBox}
        >
          <Text style={styles.totalText}>{totalFiltered} mL</Text>
        </LinearGradient>

        {/* Mensagem caso não haja registros */}
        {filteredHistory.length === 0 && (
          <Text style={styles.emptyText}>Nenhum registro ainda</Text>
        )}

        {/* Lista de registros filtrados */}
        {filteredHistory.map((item) => {
          const date = new Date(item.time);
          const formattedDate = date.toLocaleDateString("pt-BR");
          const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <View key={item.id} style={styles.recordItem}>
              {/* Ícone com gradiente */}
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="water" size={24} color="#fff" />
              </LinearGradient>

              {/* Informações do registro */}
              <View style={styles.recordTextWrapper}>
                <Text style={styles.recordAmount}>{item.amount} mL</Text>
                <Text style={styles.recordDate}>
                  {formattedDate} {formattedTime}
                </Text>
              </View>

              {/* Botão de remover */}
              <TouchableOpacity onPress={() => handleRemove(item.id)}>
                <Ionicons name="trash" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ---------------------------
// Estilos da tela
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f9ff", padding: 16 }, // Container principal
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" }, // Título da tela

  buttonsRow: { // Linha de botões de período
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  gradientButton: { borderRadius: 25, minWidth: 80, elevation: 3 }, // Botão ativo com gradiente
  touchableInside: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  viewButton: { // Botão inativo
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
  viewButtonText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  summaryContainer: { flex: 1 }, // Container da lista de histórico
  summaryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  totalBox: { padding: 12, borderRadius: 20, alignItems: "center", marginBottom: 16 },
  totalText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  emptyText: { color: "#777", fontStyle: "italic", marginBottom: 12, textAlign: "center" },

  recordItem: { // Cada registro do histórico
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
  iconGradient: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" }, // Ícone do registro
  recordTextWrapper: { flex: 1, marginLeft: 8 }, // Texto do registro
  recordAmount: { fontWeight: "bold", fontSize: 16 },
  recordDate: { color: "#555", fontSize: 12 },
});
