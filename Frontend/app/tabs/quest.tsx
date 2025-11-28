import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHistory } from "../context/HistoryContext";
import { useProfile } from "../context/ProfileContext";
import { filterHistory } from "../utils/historyUtils";

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
  const { profile, waterPerMissionMl, extraMissionMl, addXP } = useProfile();

  const [rewardedQuests, setRewardedQuests] = useState<Set<string>>(new Set());

  const quests: Quest[] = useMemo(() => {
    if (!profile) return [];

    const baseQuests: Quest[] = [
      {
        id: "d1",
        title: "Manhã",
        description: `Beber ${waterPerMissionMl.toFixed(0)} mL`,
        target: waterPerMissionMl,
        reward: 10,
        icon: "🌅",
        type: "daily",
        unit: "mL",
      },
      {
        id: "d2",
        title: "Tarde",
        description: `Beber ${waterPerMissionMl.toFixed(0)} mL`,
        target: waterPerMissionMl,
        reward: 15,
        icon: "🌞",
        type: "daily",
        unit: "mL",
      },
      {
        id: "d3",
        title: "Noite",
        description: `Beber ${waterPerMissionMl.toFixed(0)} mL`,
        target: waterPerMissionMl,
        reward: 20,
        icon: "🌙",
        type: "daily",
        unit: "mL",
      },
      {
        id: "w1",
        title: "Semana Hídrica",
        description: `Beber ${((waterPerMissionMl * 3) * 7 / 1000).toFixed(1)}L de água na semana`,
        target: (waterPerMissionMl * 3) * 7,
        reward: 50,
        icon: "📅",
        type: "weekly",
        unit: "mL",
      },
      {
        id: "m1",
        title: "Maratona da Hidratação",
        description: `Beber ${((waterPerMissionMl * 3) * 30 / 1000).toFixed(1)}L de água no mês`,
        target: (waterPerMissionMl * 3) * 30,
        reward: 200,
        icon: "🌊",
        type: "monthly",
        unit: "mL",
      },
    ];

    if (extraMissionMl > 0) {
      baseQuests.push({
        id: "d_extra",
        title: "Hidratação no Exercício",
        description: `Beber ${extraMissionMl.toFixed(0)} mL durante/após o exercício`,
        target: extraMissionMl,
        reward: 25,
        icon: "💪",
        type: "daily",
        unit: "mL",
      });
    }

    return baseQuests;
  }, [profile, waterPerMissionMl, extraMissionMl]);

  const questsProgress: QuestWithProgress[] = useMemo(() => {
    if (!profile) return [];

    const dailyHistory = filterHistory(history, "Diário");
    const weeklyHistory = filterHistory(history, "Semanal");
    const monthlyHistory = filterHistory(history, "Mensal");

    let consumedDaily = 0;

    return quests.map((q) => {
      const relevantHistory =
        q.type === "daily"
          ? dailyHistory
          : q.type === "weekly"
          ? weeklyHistory
          : monthlyHistory;
      const totalDrank = relevantHistory.reduce((sum, h) => sum + h.amount, 0);

      let progress = 0;

      if (q.unit === "mL") {
        progress =
          q.type === "daily"
            ? Math.min(Math.max(totalDrank - consumedDaily, 0), q.target)
            : Math.min(totalDrank, q.target);
        if (q.type === "daily") consumedDaily += progress;
      } else if (q.unit === "missions") {
        if (q.type === "weekly")
          progress = Math.min(
            Math.floor(totalDrank / waterPerMissionMl),
            q.target
          );
        if (q.type === "monthly")
          progress = Math.min(
            Math.floor(totalDrank / (waterPerMissionMl * 7)),
            q.target
          );
      }

      return { ...q, progress };
    });
  }, [history, quests, profile, waterPerMissionMl]);

  const gradients = {
    daily: ["#3B82F6", "#60A5FA"],
    weekly: ["#FBBF24", "#FCD34D"],
    monthly: ["#EF4444", "#F87171"],
  } as const;
  const completedGradient = ["#4ADE80", "#22C55E"];

  const handleRewardQuest = async (quest: QuestWithProgress) => {
    const completed = quest.progress >= quest.target;
    if (!completed) return;

    setRewardedQuests((prev) => {
      if (prev.has(quest.id)) return prev;
      const clone = new Set(prev);
      clone.add(quest.id);
      return clone;
    });

    // mesmo se o set ainda não refletiu, chamar addXP é ok porque a checagem de duplicidade está no estado
    await addXP(quest.reward);
  };

  const renderQuest = (item: QuestWithProgress) => {
    const completed = item.progress >= item.target;
    const progressPercent = Math.min(
      Math.round((item.progress / item.target) * 100),
      100
    );
    const alreadyRewarded = rewardedQuests.has(item.id);

    return (
      <View
        style={[
          styles.card,
          { borderLeftColor: completed ? "#4ADE80" : gradients[item.type][0] },
        ]}
        key={item.id}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.questTitle}>{item.title}</Text>
        </View>
        <Text style={styles.questDescription}>{item.description}</Text>
        <Text
          style={[
            styles.xpText,
            { color: completed ? "#4ADE80" : gradients[item.type][0] },
          ]}
        >
          Recompensa: +{item.reward} XP 🏆
        </Text>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={completed ? completedGradient : gradients[item.type]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress.toFixed(0)}/{item.target.toFixed(0)}{" "}
          {item.unit === "missions" ? "missões" : "mL"}
        </Text>
        {completed && (
          <TouchableOpacity
            onPress={() => handleRewardQuest(item)}
            disabled={alreadyRewarded}
          >
            <Text style={styles.completedText}>
              {alreadyRewarded
                ? "Recompensa recebida ✅"
                : "Missão Concluída! Toque para receber XP ✅"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderQuest(item)}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missões</Text>

      {questsProgress.some((q) => q.id === "d_extra") &&
        renderSection(
          "Missão Extra (Exercício)",
          questsProgress.filter((q) => q.id === "d_extra")
        )}

      {renderSection(
        "Diárias",
        questsProgress.filter(
          (q) => q.type === "daily" && q.id !== "d_extra"
        )
      )}
      {renderSection(
        "Semanais",
        questsProgress.filter((q) => q.type === "weekly")
      )}
      {renderSection(
        "Mensais",
        questsProgress.filter((q) => q.type === "monthly")
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: "#F5F9FF" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1E40AF",
    marginVertical: 10,
    marginLeft: 10,
  },
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
  progressBarBackground: {
    height: 14,
    backgroundColor: "#E0E7FF",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
  },
  progressBarFill: { height: 14, borderRadius: 10 },
  progressText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
    marginBottom: 8,
    textAlign: "right",
  },
  completedText: {
    color: "#16A34A",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
  },
});
