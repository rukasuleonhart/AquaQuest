import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHistory } from '../context/HistoryContext';
import { Profile as ProfileCtxType, useProfile } from '../context/ProfileContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PALETTE = {
  lightBlue: '#E6F0FF',
  waterStrong: '#007AFF',
  border: 'rgba(0,0,0,0.05)',
  text: '#1A1A1A',
  rulerText: '#555',
  complete: '#4CAF50',
  incomplete: '#CCC',
  cardBg: '#FFFFFF',
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string; // nova propriedade opcional
};

type BackendFieldKeys =
  | 'id'
  | 'name'
  | 'activity_time'
  | 'weight_kg'
  | 'ambient_temp_c'
  | 'level'
  | 'current_xp'
  | 'xp_to_next';

const iconMap: Record<
  'weight_kg' | 'activity_time' | 'ambient_temp_c',
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  weight_kg: 'weight',
  activity_time: 'run',
  ambient_temp_c: 'thermometer',
};

const backendToContextField: Record<BackendFieldKeys, keyof ProfileCtxType> = {
  id: 'id',
  name: 'name',
  activity_time: 'activityTime',
  weight_kg: 'weightKg',
  ambient_temp_c: 'ambientTempC',
  level: 'level',
  current_xp: 'currentXP',
  xp_to_next: 'xpToNext',
};

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

const getTempColor = (temp_c: number) => {
  if (temp_c <= 10) return '#007AFF';
  if (temp_c <= 20) return interpolateColor('#007AFF', '#FFD700', (temp_c - 10) / 10);
  if (temp_c <= 30) return interpolateColor('#FFD700', '#FF3B30', (temp_c - 20) / 10);
  return '#FF3B30';
};

export default function Perfil() {
  const {
    profile,
    loading,
    dailyWaterTargetMl,
    waterPerMissionMl,
    updateProfileField,
  } = useProfile();

  const { hasFirstDrink } = useHistory();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<BackendFieldKeys | null>(null);
  const [inputValue, setInputValue] = useState('');

  const [achievementPopupVisible, setAchievementPopupVisible] = useState(false);
  const hasFirstDrinkRef = useRef(hasFirstDrink);

  // novo estado para guardar a data da conquista "Primeiro Gole"
  const [firstDrinkDate, setFirstDrinkDate] = useState<string | null>(null);

  // popup conquista + registrar data/hora quando desbloqueia
  useEffect(() => {
    if (!hasFirstDrinkRef.current && hasFirstDrink) {
      const now = new Date().toISOString();
      setFirstDrinkDate(now);
      setAchievementPopupVisible(true);
    }
    hasFirstDrinkRef.current = hasFirstDrink;
  }, [hasFirstDrink]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/auth/login');
  };

  const editableFields: BackendFieldKeys[] = [
    'name',
    'weight_kg',
    'activity_time',
    'ambient_temp_c',
  ];

  const handleIconPress = (field: BackendFieldKeys) => {
    if (!profile) return;
    if (!editableFields.includes(field)) return;

    setCurrentField(field);

    const currentValueByBackendKey: Record<BackendFieldKeys, any> = {
      id: profile.id,
      name: profile.name,
      activity_time: profile.activityTime,
      weight_kg: profile.weightKg,
      ambient_temp_c: profile.ambientTempC,
      level: profile.level,
      current_xp: profile.currentXP,
      xp_to_next: profile.xpToNext,
    };

    setInputValue(String(currentValueByBackendKey[field]));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!currentField || !profile) return;

    let newValue: any = inputValue.trim();

    if (['weight_kg', 'ambient_temp_c'].includes(currentField)) {
      newValue = parseFloat(newValue.replace(',', '.'));
      if (isNaN(newValue)) return Alert.alert('Valor inválido!');
    } else if (['activity_time', 'level', 'current_xp', 'xp_to_next'].includes(currentField)) {
      newValue = parseInt(newValue, 10);
      if (isNaN(newValue)) return Alert.alert('Valor inválido!');
    }

    try {
      const contextField = backendToContextField[currentField];
      await updateProfileField(contextField, newValue);
      setModalVisible(false);
    } catch (err) {
      let errorMsg = 'Não foi possível salvar a alteração';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail
          ? JSON.stringify(err.response.data.detail)
          : errorMsg;
        console.log('Erro PATCH:', err.response?.data);
      } else {
        console.log('Erro PATCH:', err);
      }
      Alert.alert('Erro', errorMsg);
    }
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Carregando...</Text>
      </View>
    );

  if (!profile)
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Erro ao carregar perfil</Text>
      </View>
    );

  const waterGoalMl = dailyWaterTargetMl;

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeiro Gole',
      description: 'Beba água uma vez',
      completed: hasFirstDrink,
      completedAt: firstDrinkDate || undefined,
    },
    {
      id: '2',
      title: 'Resiliência',
      description: 'Beba água 30 dias consecutivos',
      completed: false,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={styles.profileName}>{profile.name}</Text>
            <TouchableOpacity onPress={() => handleIconPress('name')} style={{ marginLeft: 8 }}>
              <MaterialIcons name="edit" size={22} color={PALETTE.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <TouchableOpacity onPress={() => handleIconPress('weight_kg')}>
                <MaterialCommunityIcons name={iconMap.weight_kg} size={28} color={PALETTE.text} />
              </TouchableOpacity>
              <Text style={styles.statLabel}>Peso</Text>
              <Text style={styles.statValue}>{profile.weightKg}</Text>
            </View>

            <View style={styles.statBox}>
              <TouchableOpacity onPress={() => handleIconPress('activity_time')}>
                <MaterialCommunityIcons name={iconMap.activity_time} size={28} color={PALETTE.text} />
              </TouchableOpacity>
              <Text style={styles.statLabel}>Ativ. Física</Text>
              <Text style={styles.statValue}>{profile.activityTime} minutos</Text>
            </View>

            <View style={styles.statBox}>
              <TouchableOpacity onPress={() => handleIconPress('ambient_temp_c')}>
                <MaterialCommunityIcons
                  name={iconMap.ambient_temp_c}
                  size={28}
                  color={getTempColor(profile.ambientTempC)}
                />
              </TouchableOpacity>
              <Text style={styles.statLabel}>Temp °C</Text>
              <Text style={styles.statValue}>{profile.ambientTempC}</Text>
            </View>
          </View>

          <View style={styles.waterStatsRow}>
            <View style={styles.waterStatBox}>
              <Text style={styles.statLabel}>Meta Água (dia)</Text>
              <Text style={styles.statValue}>
                {waterGoalMl >= 1000 ? `${(waterGoalMl / 1000).toFixed(2)} L` : `${waterGoalMl} mL`}
              </Text>
            </View>
            <View style={styles.waterStatBox}>
              <Text style={styles.statLabel}>Por Missão</Text>
              <Text style={styles.statValue}>{Math.round(waterPerMissionMl)} mL</Text>
            </View>
          </View>

          <XPBar
            current_xp={profile.currentXP}
            xp_to_next={profile.xpToNext}
            level={profile.level}
          />
        </View>

        <AchievementMenu achievements={achievements} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>

        {/* Modal de edição */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Alterar valor:</Text>
              {currentField && (
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                  <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType={currentField === 'name' ? 'default' : 'decimal-pad'}
                    autoFocus
                  />
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#007AFF' }]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#FF3B30' }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Popup de conquista */}
        <Modal
          transparent
          visible={achievementPopupVisible}
          animationType="fade"
          onRequestClose={() => setAchievementPopupVisible(false)}
        >
          <View style={styles.achievementOverlay}>
            <View style={styles.achievementPopup}>
              <Text style={styles.achievementPopupTitle}>Conquista desbloqueada!</Text>
              <Text style={styles.achievementPopupText}>
                Primeiro Gole - Beba água uma vez
              </Text>
              <TouchableOpacity
                style={styles.achievementPopupButton}
                onPress={() => setAchievementPopupVisible(false)}
              >
                <Text style={styles.achievementPopupButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

function XPBar({
  current_xp,
  xp_to_next,
  level,
}: {
  current_xp: number;
  xp_to_next: number;
  level: number;
}) {
  const progress = useMemo(
    () => Math.max(0, Math.min(1, current_xp / (xp_to_next <= 0 ? 1 : xp_to_next))),
    [current_xp, xp_to_next]
  );
  const width = SCREEN_WIDTH - 64;
  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Nível {level}</Text>
        <Text style={styles.xpText}>
          {current_xp} / {xp_to_next} XP
        </Text>
      </View>
      <View style={[styles.xpBarBackground, { width }]}>
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.xpBarFill, { width: width * progress }]}
        />
      </View>
      <Text style={styles.xpMissingText}>
        {Math.max(0, xp_to_next - current_xp)} XP para o próximo nível
      </Text>
    </View>
  );
}

// função auxiliar para formatar data/hora em pt-BR
function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  // Exemplo: 28/11/2025 13:45
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AchievementMenu({ achievements }: { achievements: Achievement[] }) {
  return (
    <View style={styles.achievementContainer}>
      <Text style={styles.achievementTitle}>Conquistas</Text>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 250 }}
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <MaterialIcons
                name={item.completed ? 'emoji-events' : 'radio-button-unchecked'}
                size={28}
                color={item.completed ? PALETTE.complete : PALETTE.incomplete}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{item.title}</Text>
              <Text style={styles.achievementDescription}>{item.description}</Text>
              {item.completedAt && (
                <Text style={styles.achievementDescription}>
                  Conquistado em {formatDate(item.completedAt)}
                </Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

// --- ESTILO CSS ---
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: PALETTE.lightBlue },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  profileName: { fontSize: 26, fontWeight: '800', color: PALETTE.text, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statLabel: { fontSize: 12, color: PALETTE.rulerText, fontWeight: '500', marginTop: 4, marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: '700', color: PALETTE.text },
  xpContainer: { marginTop: 8 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  levelText: { fontWeight: '700', fontSize: 16, color: PALETTE.text },
  xpText: { fontSize: 13, color: PALETTE.rulerText },
  xpBarBackground: { height: 20, borderRadius: 14, backgroundColor: '#E3E7FF', overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 14 },
  xpMissingText: { marginTop: 6, fontSize: 13, color: PALETTE.rulerText },
  achievementContainer: {
    marginHorizontal: 20,
    backgroundColor: PALETTE.cardBg,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    color: PALETTE.text,
    textAlign: 'center',
  },
  achievementItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  achievementIcon: { width: 36, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  achievementInfo: { flex: 1 },
  achievementName: { fontWeight: '700', fontSize: 16, color: PALETTE.text },
  achievementDescription: { fontSize: 13, color: PALETTE.rulerText },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center' },
  modalText: { fontSize: 16, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 120,
    textAlign: 'center',
  },
  button: { flex: 1, paddingVertical: 10, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  waterStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  waterStatBox: {
    flex: 1,
    backgroundColor: '#D0E8FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginHorizontal: 40,
    elevation: 2,
  },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  achievementOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementPopup: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  achievementPopupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  achievementPopupText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  achievementPopupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  achievementPopupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
