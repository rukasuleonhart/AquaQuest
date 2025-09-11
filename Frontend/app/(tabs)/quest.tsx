import React, { useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { useHistory } from "../context/HistoryContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Quest = {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  icon: string;
  type: "daily" | "weekly" | "monthly";
  unit: "mL" | "missions";
};

type QuestWithProgress = Quest & { progress: number };

export default function RPGQuestsScreen() {
  const { history } = useHistory();

  const quests: Quest[] = [
    { id: "d1", title: "Poção da Manhã", description: "Beber 800 mL", target: 800, reward: 10, icon: "🧪", type: "daily", unit: "mL" },
    { id: "d2", title: "Escudo da Tarde", description: "Beber 800 mL", target: 800, reward: 15, icon: "🛡️", type: "daily", unit: "mL" },
    { id: "d3", title: "Elixir da Energia", description: "Beber 800 mL", target: 800, reward: 20, icon: "⚡", type: "daily", unit: "mL" },
    { id: "w1", title: "Semana Hídrica", description: "Beber 8L de água na semana", target: 8000, reward: 50, icon: "📅", type: "weekly", unit: "mL" },
    { id: "m1", title: "Maratona da Hidratação", description: "Beber 32L de água no mês", target: 32000, reward: 200, icon: "🌊", type: "monthly", unit: "mL" },
  ];

  const questsProgress: QuestWithProgress[] = useMemo(() => {
    let consumedDaily = 0;
    const totalDrank = history
      .filter(h => h.action === "Bebeu")
      .reduce((sum, h) => sum + h.amount, 0);

    return quests.map(q => {
      let progress = 0;
      if (q.unit === "mL") {
        if (q.type === "daily") {
          progress = Math.min(Math.max(totalDrank - consumedDaily, 0), q.target);
          consumedDaily += progress;
        } else {
          progress = Math.min(totalDrank, q.target);
        }
      } else if (q.unit === "missions") {
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

  const renderQuest = (item: QuestWithProgress) => {
    const completed = item.progress >= item.target;
    const progressPercent = Math.round((item.progress / item.target) * 100);

    const typeColors = {
      daily: "#3B82F6",
      weekly: "#F59E0B",
      monthly: "#e03314ff",
    };
    const progressColor = completed ? "#4ADE80" : typeColors[item.type];

    return (
      <View style={[styles.card, { borderLeftColor: progressColor }]} key={item.id}>
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.questTitle}>{item.title}</Text>
        </View>

        <Text style={styles.questDescription}>{item.description}</Text>
        <Text style={[styles.xpText, { color: progressColor }]}>Recompensa: +{item.reward} XP 🏆</Text>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={styles.progressText}>
          {item.progress}/{item.target} {item.unit === "missions" ? "missões" : "mL"}
        </Text>

        {completed && <Text style={styles.completedText}>Missão Concluída! ✅</Text>}
      </View>
    );
  };

  const renderSection = (title: string, data: QuestWithProgress[]) => {
    const cardWidth = SCREEN_WIDTH; // cada card ocupa toda a tela
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={cardWidth} // garante um card por swipe
          decelerationRate="fast"
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderQuest(item)}
          contentContainerStyle={{}} // sem padding horizontal
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missões RPG 💧</Text>
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
    width: SCREEN_WIDTH, // ocupa toda a tela
    marginRight: 0,      // sem espaço extra
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { fontSize: 32, marginRight: 12 },
  questTitle: { fontSize: 20, fontWeight: "700", color: "#1E40AF" },
  questDescription: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  xpText: { fontSize: 14, fontWeight: "700", marginBottom: 6 },

  progressBarBackground: { height: 14, backgroundColor: "#E0E7FF", borderRadius: 10, overflow: "hidden", marginTop: 6 },
  progressBarFill: { height: 14, borderRadius: 10 },

  progressText: { fontSize: 13, color: "#374151", marginTop: 4, marginBottom: 8, textAlign: "right" },
  completedText: { color: "#16A34A", fontWeight: "bold", textAlign: "center", marginTop: 6 },
});
