import React, { useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { useHistory } from "../components/HistoryContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Tipagem das quests
type Quest = {
  id: string;
  title: string;
  description: string;
  target: number; // meta da missão (ex: 800 mL)
  reward: number; // XP de recompensa
  icon: string; // emoji ou ícone da missão
  type: "daily" | "weekly" | "monthly";
  unit: "mL" | "missions"; // unidade de progresso
};

// Extensão da Quest para incluir progresso calculado
type QuestWithProgress = Quest & { progress: number };

/**
 * Componente principal da tela de Missões RPG
 * Mostra as missões diárias, semanais e mensais com progresso
 * baseado no histórico de consumo de água.
 */
export default function RPGQuestsScreen() {
  const { history } = useHistory(); // histórico de ações (Bebeu/Encheu)

  // Lista de quests pré-definidas
  const quests: Quest[] = [
    { id: "d1", title: "Poção da Manhã", description: "Beber 800 mL", target: 800, reward: 10, icon: "🧪", type: "daily", unit: "mL" },
    { id: "d2", title: "Escudo da Tarde", description: "Beber 800 mL", target: 800, reward: 15, icon: "🛡️", type: "daily", unit: "mL" },
    { id: "d3", title: "Elixir da Energia", description: "Beber 800 mL", target: 800, reward: 20, icon: "⚡", type: "daily", unit: "mL" },
    { id: "w1", title: "Semana Hídrica", description: "Beber 8L de água na semana", target: 8000, reward: 50, icon: "📅", type: "weekly", unit: "mL" },
    { id: "m1", title: "Maratona da Hidratação", description: "Beber 32L de água no mês", target: 32000, reward: 200, icon: "🌊", type: "monthly", unit: "mL" },
  ];

  /**
   * Calcula o progresso de cada missão baseado no histórico
   * - Para quests de mL, soma a quantidade bebida
   * - Para quests de "missions", calcula quantos dias/semanais completos foram realizados
   * O useMemo evita recalcular desnecessariamente se o histórico não mudou.
   */
  const questsProgress: QuestWithProgress[] = useMemo(() => {
    let consumedDaily = 0; // controla quantidade consumida para diárias

    // total de água bebida
    const totalDrank = history
      .filter(h => h.action === "Bebeu")
      .reduce((sum, h) => sum + h.amount, 0);

    return quests.map(q => {
      let progress = 0;

      if (q.unit === "mL") {
        if (q.type === "daily") {
          // Para diárias, subtrai quantidade já contabilizada
          progress = Math.min(Math.max(totalDrank - consumedDaily, 0), q.target);
          consumedDaily += progress;
        } else {
          progress = Math.min(totalDrank, q.target);
        }
      } else if (q.unit === "missions") {
        // Exemplo: contagem de dias ou semanas completas
        if (q.type === "weekly") {
          const daysWithAllDailies = Math.floor(totalDrank / 600);
          progress = Math.min(daysWithAllDailies, q.target);
        } else if (q.type === "monthly") {
          const weeksWithAllDailies = Math.floor(totalDrank / (600 * 7));
          progress = Math.min(weeksWithAllDailies, q.target);
        }
      }

      return { ...q, progress };
    });
  }, [history]);

  /**
   * Renderiza uma missão individual com barra de progresso, ícone e XP
   */
  const renderQuest = (item: QuestWithProgress) => {
    const completed = item.progress >= item.target;
    const progressPercent = Math.round((item.progress / item.target) * 100);

    return (
      <View style={[styles.card, completed && styles.cardCompleted]} key={item.id}>
        {/* Cabeçalho com ícone e título */}
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.questTitle}>{item.title}</Text>
        </View>

        {/* Descrição */}
        <Text style={styles.questDescription}>{item.description}</Text>

        {/* XP */}
        <Text style={styles.xpText}>Recompensa: +{item.reward} XP 🏆</Text>

        {/* Barra de progresso */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
              completed && { backgroundColor: "#4ADE80" },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress}/{item.target} {item.unit === "missions" ? "missões" : "mL"}
        </Text>

        {/* Texto de conclusão */}
        {completed && <Text style={styles.completedText}>Missão Concluída!</Text>}
      </View>
    );
  };

  /**
   * Renderiza uma seção de missões (Diárias, Semanais, Mensais)
   * com FlatList horizontal paginada
   */
  const renderSection = (title: string, data: QuestWithProgress[]) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => renderQuest(item)}
        style={{ flexGrow: 0 }}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missões</Text>
      {renderSection("Diárias", questsProgress.filter(q => q.type === "daily"))}
      {renderSection("Semanais", questsProgress.filter(q => q.type === "weekly"))}
      {renderSection("Mensais", questsProgress.filter(q => q.type === "monthly"))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: "#F5F9FF" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1E3A8A", textAlign: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "600", color: "#1E40AF", marginVertical: 10, marginLeft: 10 },
  card: {
    width: SCREEN_WIDTH - 40,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCompleted: { backgroundColor: "#E6FFFA" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { fontSize: 28, marginRight: 10 },
  questTitle: { fontSize: 18, fontWeight: "700", color: "#1E40AF" },
  questDescription: { fontSize: 14, color: "#6B7280", marginBottom: 6 },
  xpText: { fontSize: 14, color: "#1D4ED8", fontWeight: "600", marginBottom: 6 },
  progressBarBackground: { height: 12, backgroundColor: "#E0E7FF", borderRadius: 10, overflow: "hidden" },
  progressBarFill: { height: 12, backgroundColor: "#3B82F6" },
  progressText: { fontSize: 13, color: "#374151", marginTop: 4, marginBottom: 10, textAlign: "right" },
  completedText: { color: "#16A34A", fontWeight: "bold", textAlign: "center", marginTop: 6 },
});
