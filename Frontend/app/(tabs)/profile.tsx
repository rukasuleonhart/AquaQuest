// ------------------- IMPORTAÇÕES -------------------
// Ícones prontos para usar no React Native
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

// Gradiente linear para preencher barras ou backgrounds
import { LinearGradient } from "expo-linear-gradient";

// Importa React e hooks
import React, { useEffect, useMemo, useState } from "react";

// Componentes do React Native
import {
  Alert,            // Mostra mensagens de alerta
  Dimensions,       // Pega tamanho da tela
  FlatList,         // Lista eficiente para muitos itens
  KeyboardAvoidingView, // Evita que o teclado cubra os inputs
  Modal,            // Janela popup
  Platform,         // Detecta sistema operacional (iOS ou Android)
  StyleSheet,       // Criar estilos
  Text,             // Texto
  TextInput,        // Campo de entrada de texto
  TouchableOpacity, // Botão clicável
  View,             // Container de layout
} from "react-native";

// API configurada para comunicação com backend
import api from "../services/api";

// Funções para calcular metas de consumo de água
import { calculateDailyWaterTarget, calculatePerMissionTarget } from "../utils/waterUtils";

// Pega largura da tela do dispositivo
const SCREEN_WIDTH = Dimensions.get("window").width;

// Paleta de cores do app
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

// ------------------- TIPOS -------------------
// Estrutura do perfil do usuário
type Profile = {
  id: number;
  name: string;
  activityTime: number;
  weightKg: number;
  ambientTempC: number;
  level: number;
  currentXP: number;
  xpToNext: number;
};

// Estrutura de uma conquista
type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

// ------------------- XP BAR -------------------
// Componente que mostra a barra de XP
function XPBar({ currentXP, xpToNext, level }: { currentXP: number; xpToNext: number; level: number }) {
  // Calcula a porcentagem de XP atual (entre 0 e 1)
  const progress = useMemo(() => {
    const denom = xpToNext <= 0 ? 1 : xpToNext; // Evita divisão por 0
    return Math.max(0, Math.min(1, currentXP / denom));
  }, [currentXP, xpToNext]);

  const width = SCREEN_WIDTH - 64; // Largura da barra

  return (
    <View style={styles.xpContainer}>
      {/* Cabeçalho mostrando nível e XP atual */}
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Nível {level}</Text>
        <Text style={styles.xpText}>
          {currentXP} / {xpToNext} XP
        </Text>
      </View>

      {/* Barra de fundo */}
      <View style={[styles.xpBarBackground, { width }]}>
        {/* Preenchimento com gradiente */}
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.xpBarFill, { width: width * progress }]}
        />
      </View>

      {/* Texto mostrando quanto falta para o próximo nível */}
      <Text style={styles.xpMissingText}>{Math.max(0, xpToNext - currentXP)} XP para o próximo nível</Text>
    </View>
  );
}

// ------------------- ACHIEVEMENTS -------------------
// Componente que lista conquistas
function AchievementMenu({ achievements }: { achievements: Achievement[] }) {
  return (
    <View style={styles.achievementContainer}>
      <Text style={styles.achievementTitle}>Conquistas</Text>
      <FlatList
        data={achievements}          // Lista de conquistas
        keyExtractor={(item) => item.id} // Identificador único
        style={{ maxHeight: 250 }}       // Altura máxima da lista
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              {/* Ícone diferente se a conquista está completa ou não */}
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

// ------------------- ICON MAP -------------------
// Mapeia estatísticas do perfil para ícones
const iconMap: Record<keyof Pick<Profile, "weightKg" | "activityTime" | "ambientTempC">, keyof typeof MaterialCommunityIcons.glyphMap> = {
  weightKg: "weight",
  activityTime: "run",
  ambientTempC: "thermometer",
};

// ------------------- INTERPOLAÇÃO DE CORES -------------------
// Função para misturar duas cores
function interpolateColor(color1: string, color2: string, factor: number) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 0xff,
    g1 = (c1 >> 8) & 0xff,
    b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff,
    g2 = (c2 >> 8) & 0xff,
    b2 = c2 & 0xff;
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return `rgb(${r},${g},${b})`;
}

// Retorna a cor baseada na temperatura
const getTempColor = (tempC: number) => {
  if (tempC <= 10) return "#007AFF"; // azul
  if (tempC <= 20) return interpolateColor("#007AFF", "#FFD700", (tempC - 10) / 10); // azul -> amarelo
  if (tempC <= 30) return interpolateColor("#FFD700", "#FF3B30", (tempC - 20) / 10); // amarelo -> vermelho
  return "#FF3B30"; // vermelho
};

// ------------------- PERFIL COMPONENT -------------------
export default function Perfil() {
  const [profile, setProfile] = useState<Profile | null>(null); // Armazena dados do perfil
  const [loading, setLoading] = useState(true);                // Carregando ou não
  const [modalVisible, setModalVisible] = useState(false);     // Mostra modal de edição
  const [currentField, setCurrentField] = useState<keyof Profile | null>(null); // Campo sendo editado
  const [inputValue, setInputValue] = useState("");            // Valor do input do modal

  // Mapeamento entre campos do frontend e backend
  const fieldMap: Record<keyof Profile, string> = {
    id: "id",
    name: "name",
    activityTime: "activity_time",
    weightKg: "weight_kg",
    ambientTempC: "ambient_temp_c",
    level: "level",
    currentXP: "current_xp",
    xpToNext: "xp_to_next",
  };

  // Carrega perfil ao montar componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/perfil"); // Chama API
        const data: Profile = {
          id: res.data.id,
          name: res.data.name,
          activityTime: res.data.activity_time,
          weightKg: res.data.weight_kg,
          ambientTempC: res.data.ambient_temp_c,
          level: res.data.level,
          currentXP: res.data.current_xp,
          xpToNext: res.data.xp_to_next,
        };
        setProfile(data); // Salva perfil no estado
      } catch (err) {
        Alert.alert("Erro", "Não foi possível carregar o perfil"); // Alerta se falhar
      } finally {
        setLoading(false); // Para de mostrar loading
      }
    };
    fetchProfile();
  }, []);

  // Abre modal para editar campo
  const handleIconPress = (field: keyof Profile) => {
    if (!profile) return; // Se perfil não existe, não faz nada
    if (["id", "level", "currentXP", "xpToNext"].includes(field)) return; // Campos não editáveis
    setCurrentField(field); 
    setInputValue(String(profile[field])); // Coloca valor atual no input
    setModalVisible(true);                 // Mostra modal
  };

  // Salva novo valor
  const handleSave = async () => {
    if (!profile || !currentField) return;

    let newValue: any = inputValue.trim(); // Remove espaços

    // Converte para número se necessário
    if (["weightKg", "ambientTempC"].includes(currentField)) {
      newValue = parseFloat(newValue.replace(",", "."));
      if (isNaN(newValue)) return Alert.alert("Valor inválido");
    } else if (["activityTime", "level", "currentXP", "xpToNext"].includes(currentField)) {
      newValue = parseInt(newValue);
      if (isNaN(newValue)) return Alert.alert("Valor inválido");
    }

    // Cria payload completo para enviar ao backend
    const payload = {
      id: profile.id,
      name: profile.name,
      activity_time: profile.activityTime,
      weight_kg: profile.weightKg,
      ambient_temp_c: profile.ambientTempC,
      level: profile.level,
      current_xp: profile.currentXP,
      xp_to_next: profile.xpToNext,
      [fieldMap[currentField]]: newValue, // Sobrescreve campo editado
    };

    console.log("Payload enviado:", payload);

    try {
      await api.put(`/perfil/${profile.id}`, payload); // Atualiza backend
      setProfile({ ...profile, [currentField]: newValue }); // Atualiza localmente
      setModalVisible(false); // Fecha modal
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Alert.alert("Erro", "Não foi possível salvar a alteração");
    }
  };

  // Mostra loading se estiver carregando
  if (loading)
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Carregando...</Text>
      </View>
    );

  // Mostra erro se perfil não carregou
  if (!profile)
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Erro ao carregar perfil</Text>
      </View>
    );

  // ------------------- CÁLCULOS DE ÁGUA -------------------
  const waterGoalMl = calculateDailyWaterTarget(profile.weightKg);          // Meta diária
  const waterPerMissionMl = calculatePerMissionTarget(profile.weightKg, 3); // Meta por missão

  // Conquistas de exemplo
  const achievements: Achievement[] = [
    { id: "1", title: "Primeiro Gole", description: "Beba água uma vez", completed: true },
    { id: "2", title: "Dia Produtivo", description: "Complete todas as missões diárias", completed: false },
    { id: "3", title: "Resiliência", description: "Beba água 30 dias consecutivos", completed: false },
  ];

  // ------------------- RENDER -------------------
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        {/* CARD DO PERFIL */}
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{profile.name}</Text>

          {/* ESTATÍSTICAS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <TouchableOpacity onPress={() => handleIconPress("weightKg")}>
                <MaterialCommunityIcons name={iconMap.weightKg} size={28} color={PALETTE.text} />
              </TouchableOpacity>
              <Text style={styles.statLabel}>Peso</Text>
              <Text style={styles.statValue}>{profile.weightKg}</Text>
            </View>

            <View style={styles.statBox}>
              <TouchableOpacity onPress={() => handleIconPress("activityTime")}>
                <MaterialCommunityIcons name={iconMap.activityTime} size={28} color={PALETTE.text} />
              </TouchableOpacity>
              <Text style={styles.statLabel}>Ativ. Física</Text>
              <Text style={styles.statValue}>{profile.activityTime} minutos</Text>
            </View>

            <View style={styles.statBox}>
              <TouchableOpacity onPress={() => handleIconPress("ambientTempC")}>
                <MaterialCommunityIcons
                  name={iconMap.ambientTempC}
                  size={28}
                  color={getTempColor(profile.ambientTempC)}
                />
              </TouchableOpacity>
              <Text style={styles.statLabel}>Temp °C</Text>
              <Text style={styles.statValue}>{profile.ambientTempC}</Text>
            </View>
          </View>

          {/* META DE ÁGUA */}
          <View style={styles.waterStatsRow}>
            <View style={styles.waterStatBox}>
              <Text style={styles.statLabel}>Meta Água (dia)</Text>
              <Text style={styles.statValue}>{waterGoalMl} mL</Text>
            </View>
            <View style={styles.waterStatBox}>
              <Text style={styles.statLabel}>Por Missão</Text>
              <Text style={styles.statValue}>{Math.round(waterPerMissionMl)} mL</Text>
            </View>
          </View>

          {/* BARRA DE XP */}
          <XPBar currentXP={profile.currentXP} xpToNext={profile.xpToNext} level={profile.level} />
        </View>

        {/* LISTA DE CONQUISTAS */}
        <AchievementMenu achievements={achievements} />

        {/* MODAL PARA EDITAR VALORES */}
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
                <TouchableOpacity style={[styles.button, { backgroundColor: "#FF3B30" }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// ------------------- ESTILOS -------------------
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: PALETTE.lightBlue },
  profileCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginHorizontal: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6, marginBottom: 20 },
  profileName: { fontSize: 26, fontWeight: "800", color: PALETTE.text, textAlign: "center", marginBottom: 20 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: "#F5F7FA", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, marginHorizontal: 4, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  statLabel: { fontSize: 12, color: PALETTE.rulerText, fontWeight: "500", marginTop: 4, marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: "700", color: PALETTE.text },
  xpContainer: { marginTop: 8 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  levelText: { fontWeight: "700", fontSize: 16, color: PALETTE.text },
  xpText: { fontSize: 13, color: PALETTE.rulerText },
  xpBarBackground: { height: 20, borderRadius: 14, backgroundColor: "#E3E7FF", overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 14 },
  xpMissingText: { marginTop: 6, fontSize: 13, color: PALETTE.rulerText },
  achievementContainer: { marginHorizontal: 20, backgroundColor: PALETTE.cardBg, borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
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
  waterStatsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  waterStatBox: { flex: 1, backgroundColor: "#D0E8FF", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, marginHorizontal: 4, alignItems: "center" },
});
