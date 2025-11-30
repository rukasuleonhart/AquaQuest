import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHistory } from "../context/HistoryContext";
import { useProfile } from "../context/ProfileContext";
import { filterHistory } from "../utils/historyUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const REWARDED_QUESTS_KEY_BASE = "@aq_rewarded_quests";

const getRewardedKey = (userId: string) =>
  `${REWARDED_QUESTS_KEY_BASE}:${userId}`;

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
  const [xpModalVisible, setXpModalVisible] = useState(false);
  const [lastRewardedXP, setLastRewardedXP] = useState(0);
  const [lastRewardedTitle, setLastRewardedTitle] = useState("");

  useEffect(() => {
    if (!profile) return;

    const loadRewarded = async () => {
      try {
        const key = getRewardedKey(profile.id);
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed: string[] = JSON.parse(stored);
          setRewardedQuests(new Set(parsed));
        } else {
          setRewardedQuests(new Set());
        }
      } catch (e) {
        console.log("Erro ao carregar rewardedQuests", e);
      }
    };

    loadRewarded();
  }, [profile]);

  const saveRewarded = async (setData: Set<string>) => {
    if (!profile) return;
    try {
      const key = getRewardedKey(profile.id);
      const arr = Array.from(setData);
      await AsyncStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      console.log("Erro ao salvar rewardedQuests", e);
    }
  };

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
        description: `Beber ${extraMissionMl.toFixed(0)} mL`,
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

    const totalDrankDaily = dailyHistory.reduce((sum, h) => sum + h.amount, 0);
    const dailyQuota = waterPerMissionMl;
    const dailyTotalNeeded = dailyQuota * 3;

    return quests.map((q) => {
      let progress = 0;

      if (q.unit === "mL") {
        if (q.type === "daily") {
          if (q.id === "d1" || q.id === "d2" || q.id === "d3") {
            const clampedDaily = Math.min(totalDrankDaily, dailyTotalNeeded);
            const index = q.id === "d1" ? 0 : q.id === "d2" ? 1 : 2;
            const missionStart = dailyQuota * index;

            progress = Math.min(
              Math.max(clampedDaily - missionStart, 0),
              dailyQuota
            );
          } else if (q.id === "d_extra") {
            const extraAvailable = Math.max(
              totalDrankDaily - dailyTotalNeeded,
              0
            );
            progress = Math.min(extraAvailable, q.target);
          } else if (q.id === "w1" || q.id === "m1") {
            const relevantHistory =
              q.type === "weekly"
                ? weeklyHistory
                : q.type === "monthly"
                ? monthlyHistory
                : dailyHistory;
            const totalDrank = relevantHistory.reduce(
              (sum, h) => sum + h.amount,
              0
            );
            progress = Math.min(totalDrank, q.target);
          }
        } else {
          const relevantHistory =
            q.type === "weekly"
              ? weeklyHistory
              : q.type === "monthly"
              ? monthlyHistory
              : dailyHistory;
          const totalDrank = relevantHistory.reduce(
            (sum, h) => sum + h.amount,
            0
          );
          progress = Math.min(totalDrank, q.target);
        }
      } else if (q.unit === "missions") {
        const relevantHistory =
          q.type === "weekly"
            ? weeklyHistory
            : q.type === "monthly"
            ? monthlyHistory
            : dailyHistory;
        const totalDrank = relevantHistory.reduce(
          (sum, h) => sum + h.amount,
          0
        );

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
    const completed = quest.target > 0 && quest.progress >= quest.target;
    if (!completed) return;

    let updated: Set<string> | undefined;

    setRewardedQuests((prev) => {
      if (prev.has(quest.id)) {
        updated = prev;
        return prev;
      }
      const clone = new Set(prev);
      clone.add(quest.id);
      updated = clone;
      return clone;
    });

    if (updated) {
      await saveRewarded(updated);
    }

    await addXP(quest.reward);

    setLastRewardedXP(quest.reward);
    setLastRewardedTitle(quest.title);
    setXpModalVisible(true);
  };

  const renderQuest = (item: QuestWithProgress) => {
    const completed = item.target > 0 && item.progress >= item.target;
    const alreadyRewarded = rewardedQuests.has(item.id);

    const progressPercent =
      item.target > 0
        ? Math.min(Math.round((item.progress / item.target) * 100), 100)
        : 0;

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
        {completed && item.target > 0 && (
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>

      <Modal
        visible={xpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setXpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>XP Resgatado!</Text>
            <Text style={styles.modalText}>
              Você resgatou {lastRewardedXP} XP na missão:
            </Text>
            <Text style={styles.modalMissionTitle}>{lastRewardedTitle}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setXpModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FF" },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
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
    marginBottom: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16A34A",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  modalMissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    textAlign: "center",
    marginVertical: 10,
  },
  modalButton: {
    marginTop: 12,
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
