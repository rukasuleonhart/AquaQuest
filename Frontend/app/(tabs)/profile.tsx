// ---------------------------
// Importações
// ---------------------------
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"; // Ícones
import { LinearGradient } from "expo-linear-gradient"; // Gradientes
import React, { useMemo, useState } from "react"; // React e hooks
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // Componentes básicos do RN

// ---------------------------
// Constantes da tela e cores
// ---------------------------
const SCREEN_WIDTH = Dimensions.get("window").width; // Largura da tela

const PALETTE = {
  lightBlue: "#E6F0FF",
  waterStrong: "#007AFF",
  border: "rgba(0,0,0,0.05)",
  text: "#1A1A1A",
  rulerText: "#555",
  complete: "#4CAF50",
  incomplete: "#CCC",
  cardBg: "#FFFFFF",
};

// ---------------------------
// Tipagens TypeScript
// ---------------------------
type Profile = {
  name: string;
  activityTime: number; // horas de atividade física
  weightKg: number;
  ambientTempC: number; // temperatura ambiente
  level: number;        // nível do usuário
  currentXP: number;    // XP atual
  xpToNext: number;     // XP necessário para o próximo nível
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

// ---------------------------
// Componente da barra de XP
// ---------------------------
function XPBar({ currentXP, xpToNext, level }: { currentXP: number; xpToNext: number; level: number }) {
  // Calcula progresso de 0 a 1
  const progress = useMemo(() => {
    const denom = xpToNext <= 0 ? 1 : xpToNext;
    return Math.max(0, Math.min(1, currentXP / denom));
  }, [currentXP, xpToNext]);

  const width = SCREEN_WIDTH - 64; // largura da barra

  return (
    <View style={styles.xpContainer}>
      {/* Cabeçalho com nível e XP atual */}
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Nível {level}</Text>
        <Text style={styles.xpText}>
          {currentXP} / {xpToNext} XP
        </Text>
      </View>

      {/* Barra de XP com gradiente */}
      <View style={[styles.xpBarBackground, { width }]}>
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.xpBarFill, { width: width * progress }]} // preenche de acordo com progresso
        />
      </View>

      {/* XP restante */}
      <Text style={styles.xpMissingText}>{Math.max(0, xpToNext - currentXP)} XP para o próximo nível</Text>
    </View>
  );
}

// ---------------------------
// Componente de menu de conquistas
// ---------------------------
function AchievementMenu({ achievements }: { achievements: Achievement[] }) {
  return (
    <View style={styles.achievementContainer}>
      <Text style={styles.achievementTitle}>Conquistas</Text>

      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            {/* Ícone de conquista */}
            <View style={styles.achievementIcon}>
              <MaterialIcons
                name={item.completed ? "emoji-events" : "radio-button-unchecked"} // completo ou não
                size={28}
                color={item.completed ? PALETTE.complete : PALETTE.incomplete}
              />
            </View>

            {/* Nome e descrição */}
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

// ---------------------------
// Mapeamento de ícones para stats do usuário
// ---------------------------
const iconMap: Record<keyof Pick<Profile, "weightKg" | "activityTime" | "ambientTempC">, keyof typeof MaterialCommunityIcons.glyphMap> = {
  weightKg: "weight",
  activityTime: "soccer",
  ambientTempC: "thermometer",
};

// ---------------------------
// Função auxiliar para interpolar cores
// ---------------------------
function interpolateColor(color1: string, color2: string, factor: number) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `rgb(${r},${g},${b})`;
}

// ---------------------------
// Função para definir cor da temperatura
// ---------------------------
const getTempColor = (tempC: number) => {
  if (tempC <= 10) return "#007AFF"; // azul frio
  if (tempC <= 20) return interpolateColor("#007AFF", "#FFD700", (tempC - 10) / 10); // azul->amarelo
  if (tempC <= 30) return interpolateColor("#FFD700", "#FF3B30", (tempC - 20) / 10); // amarelo->vermelho
  return "#FF3B30"; // vermelho quente
};

// ---------------------------
// Componente principal do Perfil
// ---------------------------
export default function Perfil() {
  const [profile, setProfile] = useState<Profile>({
    name: "Olá, </>",
    weightKg: 50,
    activityTime: 2,
    ambientTempC: 33,
    level: 0,
    currentXP: 40,
    xpToNext: 100,
  });

  // Modal para editar campos
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<keyof Profile | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  // ---------------------------
  // Funções para abrir modal e editar campo
  // ---------------------------
  const handleIconPress = (field: keyof Profile) => {
    setCurrentField(field);
    setInputValue(String(profile[field])); // valor atual
    setModalVisible(true);
  };

  const handleSave = () => {
    if (currentField) {
      const newValue = parseFloat(inputValue.replace(",", "."));
      setProfile((prev) => ({
        ...prev,
        [currentField]: !isNaN(newValue) ? newValue : prev[currentField], // atualiza valor
      }));
    }
    setModalVisible(false);
  };

  const handleCancel = () => setModalVisible(false);

  // Conquistas de exemplo
  const achievements: Achievement[] = [
    { id: "1", title: "Primeiro Gole", description: "Beba água uma vez", completed: true },
    { id: "2", title: "Dia Produtivo", description: "Complete todas as missões diárias", completed: false },
    { id: "3", title: "Resiliência", description: "Beba água 30 dias consecutivos", completed: false },
  ];

  // ---------------------------
  // Render da UI
  // ---------------------------
  return (
    <View style={styles.container}>
      {/* Card de perfil */}
      <View style={styles.profileCard}>
        <Text style={styles.profileName}>{profile.name}</Text>

        {/* Linha de estatísticas */}
        <View style={styles.statsRow}>
          {/* Peso */}
          <View style={styles.statBox}>
            <TouchableOpacity onPress={() => handleIconPress("weightKg")}>
              <MaterialCommunityIcons name={iconMap.weightKg} size={28} color={PALETTE.text} />
            </TouchableOpacity>
            <Text style={styles.statLabel}>Peso</Text>
            <Text style={styles.statValue}>{profile.weightKg}</Text>
          </View>

          {/* Atividade física */}
          <View style={styles.statBox}>
            <TouchableOpacity onPress={() => handleIconPress("activityTime")}>
              <MaterialCommunityIcons name={iconMap.activityTime} size={28} color={PALETTE.text} />
            </TouchableOpacity>
            <Text style={styles.statLabel}>Ativ. Física</Text>
            <Text style={styles.statValue}>{profile.activityTime} horas</Text>
          </View>

          {/* Temperatura ambiente */}
          <View style={styles.statBox}>
            <TouchableOpacity onPress={() => handleIconPress("ambientTempC")}>
              <MaterialCommunityIcons name={iconMap.ambientTempC} size={28} color={getTempColor(profile.ambientTempC)} />
            </TouchableOpacity>
            <Text style={styles.statLabel}>Temp °C</Text>
            <Text style={styles.statValue}>{profile.ambientTempC}</Text>
          </View>
        </View>

        {/* Barra de XP */}
        <XPBar currentXP={profile.currentXP} xpToNext={profile.xpToNext} level={profile.level} />
      </View>

      {/* Menu de conquistas */}
      <AchievementMenu achievements={achievements} />

      {/* Modal para edição */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Alterar valor:</Text>

            {currentField && (
              <View style={{ marginBottom: 20, alignItems: "center" }}>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#007AFF" }]} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { backgroundColor: "#FF3B30" }]} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------------
// Estilos
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: PALETTE.lightBlue },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  profileName: { fontSize: 26, fontWeight: "800", color: PALETTE.text, textAlign: "center", marginBottom: 20 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statLabel: { fontSize: 12, color: PALETTE.rulerText, fontWeight: "500", marginTop: 4, marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "700", color: PALETTE.text },
  xpContainer: { marginTop: 8 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  levelText: { fontWeight: "700", fontSize: 16, color: PALETTE.text },
  xpText: { fontSize: 13, color: PALETTE.rulerText },
  xpBarBackground: { height: 20, borderRadius: 14, backgroundColor: "#E3E7FF", overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 14 },
  xpMissingText: { marginTop: 6, fontSize: 13, color: PALETTE.rulerText },
  achievementContainer: { marginTop: 0, marginHorizontal: 20, backgroundColor: PALETTE.cardBg, borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  achievementTitle: { fontSize: 22, fontWeight: "700", marginBottom: 18, color: PALETTE.text, textAlign: "center" },
  achievementItem: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  achievementIcon: { width: 36, alignItems: "center", justifyContent: "center", marginRight: 14 },
  achievementInfo: { flex: 1 },
  achievementName: { fontWeight: "700", fontSize: 16, color: PALETTE.text },
  achievementDescription: { fontSize: 13, color: PALETTE.rulerText },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 16, alignItems: "center" },
  modalText: { fontSize: 16, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  input: { borderWidth: 1, borderColor: "#CCC", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, width: 120, textAlign: "center" },
  button: { flex: 1, paddingVertical: 10, borderRadius: 8, marginHorizontal: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
