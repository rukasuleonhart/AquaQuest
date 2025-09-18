// Importa o LinearGradient do Expo para criar barras de progresso coloridas
import { LinearGradient } from "expo-linear-gradient";

// Importa React e hooks importantes
import React, { useMemo } from "react";

// Importa componentes do React Native
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

// Importa hooks personalizados para acessar histórico e perfil do usuário
import { useHistory } from "../context/HistoryContext";
import { useProfile } from "../context/ProfileContext";

// Importa funções utilitárias para cálculo de água e filtragem de histórico
import { calculateDailyWaterTarget, calculatePerMissionTarget } from "../utils/waterUtils";
import { filterHistory } from "../utils/historyUtils";

// Pega a largura da tela do dispositivo para usar no FlatList
const SCREEN_WIDTH = Dimensions.get("window").width;

// ---------------------------
// Tipagem das quests (missões)
// ---------------------------
type Quest = {
  id: string;
  title: string; // título da missão
  description: string; // descrição da missão
  target: number; // objetivo a ser alcançado
  reward: number; // recompensa em XP
  icon: string; // emoji ou ícone da missão
  type: "daily" | "weekly" | "monthly"; // tipo da missão
  unit: "mL" | "missions"; // unidade de progresso (água em mL ou número de missões)
};

// Extende Quest para incluir progresso atual
type QuestWithProgress = Quest & { progress: number };

// ---------------------------
// Componente principal da tela de quests
// ---------------------------
export default function RPGQuestsScreen() {
  // Pega histórico de consumo de água
  const { history } = useHistory();
  // Pega perfil do usuário (peso, nome, etc.)
  const { profile } = useProfile();

  // ---------------------------
  // Criação das quests com valores dinâmicos baseados no perfil
  // useMemo é usado para recalcular apenas quando o profile mudar
  // ---------------------------
  const quests: Quest[] = useMemo(() => {
    if (!profile) return []; // se não houver perfil, retorna array vazio

    // Calcula quanto o usuário deve beber por missão (ex.: manhã, tarde, noite)
    const perMissionTarget = calculatePerMissionTarget(profile.weightKg, 3); 
    // Calcula meta diária total de água
    const dailyTarget = calculateDailyWaterTarget(profile.weightKg);

    return [
      {
        id: "d1",
        title: "Manhã",
        description: `Beber ${perMissionTarget.toFixed(0)} mL`,
        target: perMissionTarget,
        reward: 10,
        icon: "🌅",
        type: "daily",
        unit: "mL",
      },
      {
        id: "d2",
        title: "Tarde",
        description: `Beber ${perMissionTarget.toFixed(0)} mL`,
        target: perMissionTarget,
        reward: 15,
        icon: "🌞",
        type: "daily",
        unit: "mL",
      },
      {
        id: "d3",
        title: "Noite",
        description: `Beber ${perMissionTarget.toFixed(0)} mL`,
        target: perMissionTarget,
        reward: 20,
        icon: "🌙",
        type: "daily",
        unit: "mL",
      },
      {
        id: "w1",
        title: "Semana Hídrica",
        description: `Beber ${(dailyTarget * 7 / 1000).toFixed(1)}L de água na semana`,
        target: dailyTarget * 7,
        reward: 50,
        icon: "📅",
        type: "weekly",
        unit: "mL",
      },
      {
        id: "m1",
        title: "Maratona da Hidratação",
        description: `Beber ${(dailyTarget * 30 / 1000).toFixed(1)}L de água no mês`,
        target: dailyTarget * 30,
        reward: 200,
        icon: "🌊",
        type: "monthly",
        unit: "mL",
      },
    ];
  }, [profile]);

  // ---------------------------
  // Calcula progresso atual de cada missão
  // ---------------------------
  const questsProgress: QuestWithProgress[] = useMemo(() => {
    if (!profile) return [];

    const dailyTarget = calculateDailyWaterTarget(profile.weightKg);
    const perMissionTarget = calculatePerMissionTarget(profile.weightKg, 3);

    // Filtra histórico por tipo de missão
    const dailyHistory = filterHistory(history, "Diário");
    const weeklyHistory = filterHistory(history, "Semanal");
    const monthlyHistory = filterHistory(history, "Mensal");

    let consumedDaily = 0; // usado para calcular progresso diário

    return quests.map(q => {
      // seleciona histórico relevante para cada tipo de missão
      let relevantHistory = history;
      if (q.type === "daily") relevantHistory = dailyHistory;
      else if (q.type === "weekly") relevantHistory = weeklyHistory;
      else if (q.type === "monthly") relevantHistory = monthlyHistory;

      // soma total consumido nesse histórico
      const totalDrank = relevantHistory.reduce((sum, h) => sum + h.amount, 0);
      let progress = 0;

      // calcula progresso dependendo da unidade da missão
      if (q.unit === "mL") {
        if (q.type === "daily") {
          progress = Math.min(Math.max(totalDrank - consumedDaily, 0), q.target);
          consumedDaily += progress;
        } else {
          progress = Math.min(totalDrank, q.target);
        }
      } else if (q.unit === "missions") {
        if (q.type === "weekly") {
          const daysWithAllDailies = Math.floor(totalDrank / dailyTarget);
          progress = Math.min(daysWithAllDailies, q.target);
        } else if (q.type === "monthly") {
          const weeksWithAllDailies = Math.floor(totalDrank / (dailyTarget * 7));
          progress = Math.min(weeksWithAllDailies, q.target);
        }
      }

      return { ...q, progress };
    });
  }, [history, quests, profile]);

  // ---------------------------
  // Renderiza cada card de missão
  // ---------------------------
  const renderQuest = (item: QuestWithProgress) => {
    const completed = item.progress >= item.target; // missão concluída?
    const progressPercent = Math.min(Math.round((item.progress / item.target) * 100), 100);

    // Cores diferentes para cada tipo de missão
    const typeGradients = {
      daily: ["#3B82F6", "#60A5FA"] as const,
      weekly: ["#FBBF24", "#FCD34D"] as const,
      monthly: ["#EF4444", "#F87171"] as const,
    };
    const completedGradient = ["#4ADE80", "#22C55E"] as const;

    return (
      <View style={[styles.card, { borderLeftColor: completed ? "#4ADE80" : typeGradients[item.type][0] }]} key={item.id}>
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.questTitle}>{item.title}</Text>
        </View>
        <Text style={styles.questDescription}>{item.description}</Text>
        <Text style={[styles.xpText, { color: completed ? "#4ADE80" : typeGradients[item.type][0] }]}>
          Recompensa: +{item.reward} XP 🏆
        </Text>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={completed ? completedGradient : typeGradients[item.type]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress.toFixed(0)}/{item.target.toFixed(0)} {item.unit === "missions" ? "missões" : "mL"}
        </Text>
        {completed && <Text style={styles.completedText}>Missão Concluída! ✅</Text>}
      </View>
    );
  };

  // ---------------------------
  // Renderiza seção de missões (diárias, semanais, mensais)
  // ---------------------------
  const renderSection = (title: string, data: QuestWithProgress[]) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        keyExtractor={item => item.id}
        renderItem={({ item }) => renderQuest(item)}
      />
    </>
  );

  // ---------------------------
  // Retorna a tela completa
  // ---------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missões</Text>
      {renderSection("Diárias", questsProgress.filter(q => q.type === "daily"))}
      {renderSection("Semanais", questsProgress.filter(q => q.type === "weekly"))}
      {renderSection("Mensais", questsProgress.filter(q => q.type === "monthly"))}
    </View>
  );
}

// ---------------------------
// Estilos da tela
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: "#F5F9FF" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1E3A8A", textAlign: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "600", color: "#1E40AF", marginVertical: 10, marginLeft: 10 },
  card: {
    width: SCREEN_WIDTH,
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
