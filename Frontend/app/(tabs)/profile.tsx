import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const PALETTE = {
  lightBlue: "#E6F0FF",
  waterStrong: "#007AFF",
  border: "rgba(0,0,0,0.05)",
  text: "#1A1A1A",
  rulerText: "#555",
  complete: "#4CAF50",
  incomplete: "#CCC",
  cardBg: "#FFFFFF",
  inputBg: "#F5F7FA",
};

// Tipos
type Profile = { name: string; age: number; weightKg: number; ambientTempC: number; level: number; currentXP: number; xpToNext: number; };
type Achievement = { id: string; title: string; description: string; completed: boolean; };

function XPBar({ currentXP, xpToNext, level }: { currentXP: number; xpToNext: number; level: number }) {
  const progress = useMemo(() => {
    const denom = xpToNext <= 0 ? 1 : xpToNext;
    return Math.max(0, Math.min(1, currentXP / denom));
  }, [currentXP, xpToNext]);

  const width = SCREEN_WIDTH - 64;

  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Nível {level}</Text>
        <Text style={styles.xpText}>{currentXP} / {xpToNext} XP</Text>
      </View>

      <View style={[styles.xpBarBackground, { width }]}>
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.xpBarFill, { width: width * progress }]}
        />
      </View>

      <Text style={styles.xpMissingText}>{Math.max(0, xpToNext - currentXP)} XP para o próximo nível</Text>
    </View>
  );
}

function AchievementMenu({ achievements }: { achievements: Achievement[] }) {
  return (
    <View style={styles.achievementContainer}>
      <Text style={styles.achievementTitle}>Conquistas</Text>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <MaterialIcons
                name={item.completed ? "emoji-events" : "radio-button-unchecked"}
                size={28}
                color={item.completed ? PALETTE.complete : PALETTE.incomplete}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{item.title}</Text>
              <Text style={styles.achievementDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

export default function Perfil() {
  const [profile, setProfile] = useState<Profile>({
    name: "Olá, viajante",
    age: 24,
    weightKg: 50,
    ambientTempC: 33,
    level: 0,
    currentXP: 40,
    xpToNext: 100,
  });

  const achievements: Achievement[] = [
    { id: "1", title: "Primeiro Gole", description: "Beba água uma vez", completed: true },
    { id: "2", title: "Dia Produtivo", description: "Complete todas as missões diárias", completed: false },
    { id: "3", title: "Resiliência", description: "Beba água 30 dias consecutivos", completed: false },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{profile.name}</Text>

        <View style={styles.row}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Idade</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(profile.age)}
              onChangeText={(value) => setProfile((p) => ({ ...p, age: Number(value) || 0 }))}
            />

            <Text style={[styles.infoLabel, { marginTop: 12 }]}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(profile.weightKg)}
              onChangeText={(value) => setProfile((p) => ({ ...p, weightKg: Number(value) || 0 }))}
            />

            <Text style={[styles.infoLabel, { marginTop: 12 }]}>Temperatura °C</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(profile.ambientTempC)}
              onChangeText={(value) => setProfile((p) => ({ ...p, ambientTempC: Number(value) || 0 }))}
            />
          </View>
        </View>

        <XPBar currentXP={profile.currentXP} xpToNext={profile.xpToNext} level={profile.level} />
      </View>

      <AchievementMenu achievements={achievements} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: PALETTE.lightBlue },

  card: {
    backgroundColor: PALETTE.cardBg,
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoColumn: { flex: 1, paddingRight: 12 },
  name: { fontSize: 28, fontWeight: "800", color: PALETTE.text, textAlign: "center", marginBottom: 20 },
  infoLabel: { color: PALETTE.rulerText, fontSize: 13, fontWeight: "500" },
  input: {
    backgroundColor: PALETTE.inputBg,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    color: PALETTE.text,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },

  xpContainer: { marginTop: 24 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  levelText: { fontWeight: "700", fontSize: 16, color: PALETTE.text },
  xpText: { fontSize: 13, color: PALETTE.rulerText },
  xpBarBackground: { height: 20, borderRadius: 14, backgroundColor: "#E3E7FF", overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 14 },
  xpMissingText: { marginTop: 6, fontSize: 13, color: PALETTE.rulerText },

  achievementContainer: {
    marginTop: 28,
    marginHorizontal: 20,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  achievementTitle: { fontSize: 22, fontWeight: "700", marginBottom: 18, color: PALETTE.text, textAlign: "center" },
  achievementItem: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  achievementIcon: { width: 36, alignItems: "center", justifyContent: "center", marginRight: 14 },
  achievementInfo: { flex: 1 },
  achievementName: { fontWeight: "700", fontSize: 16, color: PALETTE.text },
  achievementDescription: { fontSize: 13, color: PALETTE.rulerText },
});
