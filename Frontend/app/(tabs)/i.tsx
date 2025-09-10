import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

// Obtém a largura da tela do dispositivo, usada para calcular o tamanho da barra de XP
const SCREEN_WIDTH = Dimensions.get("window").width;

// Paleta de cores reutilizável
const PALETTE = {
  lightBlue: "#E6F0FF",
  waterStrong: "rgba(0,122,255,0.9)",
  border: "rgba(255,255,255,0.4)",
  text: "#123",
  rulerText: "#555",
  complete: "#4CAF50",
  incomplete: "#999",
};

// Tipagem do perfil do usuário
type Profile = {
  name: string;
  age: number;
  weightKg: number;
  ambientTempC: number;
  level: number;
  currentXP: number;
  xpToNext: number;
};

// Tipagem de conquistas
type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

/**
 * Componente que exibe a barra de XP do jogador.
 * Mostra o nível atual, XP atual, XP necessário para o próximo nível
 * e a barra de progresso proporcional.
 */
function XPBar({ currentXP, xpToNext, level }: { currentXP: number; xpToNext: number; level: number }) {
  // Calcula o progresso da barra (entre 0 e 1)
  const progress = useMemo(() => {
    const denom = xpToNext <= 0 ? 1 : xpToNext;
    return Math.max(0, Math.min(1, currentXP / denom));
  }, [currentXP, xpToNext]);

  const width = SCREEN_WIDTH - 64; // largura da barra com margem

  return (
    <View style={styles.xpContainer}>
      {/* Cabeçalho com nível e XP */}
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Nível {level}</Text>
        <Text style={styles.xpText}>
          {currentXP} XP / {xpToNext} XP
        </Text>
      </View>

      {/* Barra de XP */}
      <View style={[styles.xpBarBackground, { width }]}>
        <View
          style={[
            styles.xpBarFill,
            {
              width: width * progress, // Preenche proporcional ao progresso
              backgroundColor: PALETTE.waterStrong,
            },
          ]}
        />
      </View>

      {/* Texto mostrando quanto falta para o próximo nível */}
      <Text style={styles.xpMissingText}>
        {Math.max(0, xpToNext - currentXP)} XP para o próximo nível
      </Text>
    </View>
  );
}

/**
 * Componente que exibe a lista de conquistas do jogador.
 * Recebe um array de conquistas e indica se cada uma está completa.
 */
function AchievementMenu({ achievements }: { achievements: Achievement[] }) {
  return (
    <View style={styles.achievementContainer}>
      <Text style={styles.achievementTitle}>🏆 Conquistas</Text>

      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            {/* Ícone de conquista (checkbox) */}
            <Text
              style={[
                styles.achievementIcon,
                { color: item.completed ? PALETTE.complete : PALETTE.incomplete },
              ]}
            >
              {item.completed ? "✅" : "⬜"}
            </Text>
            <View style={styles.achievementInfo}>
              {/* Título e descrição da conquista */}
              <Text style={styles.achievementName}>{item.title}</Text>
              <Text style={styles.achievementDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

/**
 * Componente principal da tela de perfil.
 * Permite editar informações do perfil, visualizar XP e conquistas.
 */
export default function Perfil() {
  // Estado do perfil do usuário
  const [profile, setProfile] = useState<Profile>({
    name: "Olá, viajante",
    age: 24,
    weightKg: 50,
    ambientTempC: 33,
    level: 0,
    currentXP: 40,
    xpToNext: 100,
  });

  // Lista de conquistas iniciais
  const achievements: Achievement[] = [
    { id: "1", title: "Primeiro Gole", description: "Beba água uma vez", completed: true },
    { id: "2", title: "Dia Produtivo", description: "Complete todas as missões diárias", completed: false },
    { id: "3", title: "Resiliência", description: "Beba água 30 dias consecutivos", completed: false },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {/* Card com informações do perfil e barra de XP */}
      <View style={styles.card}>
        <Text style={styles.name}>{profile.name}</Text>

        <View style={styles.row}>
          <View style={styles.infoColumn}>
            {/* Campo de idade */}
            <Text style={styles.infoLabel}>Idade</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(profile.age)}
              onChangeText={(value) => setProfile((p) => ({ ...p, age: Number(value) || 0 }))}
            />

            {/* Campo de peso */}
            <Text style={[styles.infoLabel, { marginTop: 12 }]}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(profile.weightKg)}
              onChangeText={(value) => setProfile((p) => ({ ...p, weightKg: Number(value) || 0 }))}
            />

            {/* Campo de temperatura ambiente */}
            <Text style={[styles.infoLabel, { marginTop: 12 }]}>Temperatura °C</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(profile.ambientTempC)}
              onChangeText={(value) => setProfile((p) => ({ ...p, ambientTempC: Number(value) || 0 }))}
            />
          </View>
        </View>

        {/* Barra de XP */}
        <XPBar currentXP={profile.currentXP} xpToNext={profile.xpToNext} level={profile.level} />
      </View>

      {/* Menu de conquistas */}
      <AchievementMenu achievements={achievements} />
    </View>
  );
}

// Estilos reutilizáveis
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: PALETTE.lightBlue },
  title: { fontSize: 28, fontWeight: "bold", color: PALETTE.text, textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoColumn: { flex: 1, paddingRight: 12 },
  name: { fontSize: 24, fontWeight: "700", color: PALETTE.text, textAlign: "center", marginBottom: 12 },
  infoLabel: { color: PALETTE.rulerText, fontSize: 12 },
  input: {
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
  },
  xpContainer: { marginTop: 18 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  levelText: { fontWeight: "700", fontSize: 16 },
  xpText: { fontSize: 12, color: PALETTE.rulerText },
  xpBarBackground: { height: 18, borderRadius: 12, backgroundColor: "#E0E7FF", overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border },
  xpBarFill: { height: "100%", borderRadius: 12 },
  xpMissingText: { marginTop: 6, fontSize: 12, color: PALETTE.rulerText },

  achievementContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  achievementTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: PALETTE.text, textAlign: "center" },
  achievementItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  achievementIcon: { fontSize: 20, marginRight: 8 },
  achievementInfo: { flex: 1 },
  achievementName: { fontWeight: "600", fontSize: 16, color: PALETTE.text },
  achievementDescription: { fontSize: 12, color: PALETTE.rulerText },
});
