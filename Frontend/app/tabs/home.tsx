// ---------------------------
// Importações
// ---------------------------
import { LinearGradient } from "expo-linear-gradient"; // Permite criar gradientes de cores, usado para a água e botão
import React, { useEffect, useRef, useState } from "react"; // Importa React e hooks (estado, referência e efeito)
import {
  Animated, // Para animações
  Dimensions, // Para pegar o tamanho da tela
  Easing, // Componente container
  Modal, // Para controlar o ritmo das animações
  PanResponder, // Para detectar gestos de toque e arrasto
  StyleSheet, // Para criar estilos
  Text, // Modal para valor personalizado
  TextInput, // Componente de texto
  TouchableOpacity, // Componente de botão clicável
  View, // Componente container
} from "react-native";
import { useHistory } from "../context/HistoryContext"; // Hook para acessar e salvar histórico global de consumo


// ---------------------------
// Constantes da tela
// ---------------------------
const { height: SCREEN_HEIGHT } = Dimensions.get("window"); // Pega a altura da tela do dispositivo

const MAX_WATER_LEVEL = 1; // Nível máximo do copo (cheio)
const MIN_WATER_LEVEL = 0; // Nível mínimo do copo (vazio)
const MAX_ML = 500; // Quantidade máxima em mL que o copo representa


// ---------------------------
// Componente principal da tela de consumo interativo
// ---------------------------
export default function Home() {
  const { addToHistory } = useHistory(); // Função para adicionar quantidade de água consumida no histórico global

  // Estado e referência do nível de água
  const waterLevel = useRef(new Animated.Value(0.8)).current; // Valor animado para a altura da água
  const [currentLevel, setCurrentLevel] = useState(0.8); // Estado do nível atual da água
  const gestureStartLevel = useRef(0); // Para guardar o nível quando o usuário começa a arrastar

  // Estados do modal de valor personalizado
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState(String(Math.round(0.8 * MAX_ML)));

  // Configurações visuais
  const INSTANT_FILL_DURATION = 300; // Tempo para encher instantaneamente
  const cupWidth = 150; // Largura do copo
  const cupHeight = 300; // Altura do copo

  // ---------------------------
  // Bolhas animadas
  // ---------------------------
  const bubbleCount = 8; // Número de bolhas
  const bubbles = useRef(
    Array.from({ length: bubbleCount }).map(() => ({
      y: new Animated.Value(cupHeight * Math.random() * 0.85), // Posição vertical da bolha
      xOffset: Math.random() * 20 - 10, // Deslocamento horizontal para movimento
      baseX: Math.random() * cupWidth * 0.7 + 20, // Posição base horizontal
      size: 4 + Math.random() * 12, // Tamanho da bolha
      speed: 2000 + Math.random() * 2000, // Velocidade da animação
      fade: new Animated.Value(0), // Opacidade da bolha
    }))
  ).current;

  // Efeito para animar as bolhas
  useEffect(() => {
    bubbles.forEach((bubble) => {
      const animate = () => {
        bubble.y.setValue(cupHeight * 0.85); // Começa no fundo do copo
        bubble.fade.setValue(0); // Começa invisível

        Animated.parallel([
          // Movimento vertical
          Animated.timing(bubble.y, {
            toValue: 0, // Vai até o topo do copo
            duration: bubble.speed, // Duração
            easing: Easing.linear, // Movimento constante
            useNativeDriver: true,
          }),
          // Aparecer e desaparecer (fade)
          Animated.sequence([
            Animated.timing(bubble.fade, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(bubble.fade, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]).start(() => animate()); // Loop infinito
      };
      animate();
    });
  }, []);

  // ---------------------------
  // Gestos para arrastar água
  // ---------------------------
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Sempre começa responder ao toque
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5, // Responde ao movimento vertical maior que 5px

      onPanResponderGrant: () => {
        waterLevel.stopAnimation((value) => {
          gestureStartLevel.current = value; // Salva o nível atual ao começar arrastar
        });
      },

      onPanResponderMove: (_, g) => {
        const sensitivity = 200;
        let newLevel = gestureStartLevel.current - g.dy / sensitivity; // Calcula novo nível com base no movimento vertical
        newLevel = Math.min(Math.max(newLevel, MIN_WATER_LEVEL), MAX_WATER_LEVEL); // Limita entre 0 e 1
        waterLevel.setValue(newLevel); // Atualiza animação
        setCurrentLevel(newLevel); // Atualiza estado
      },

      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dy) < 5) {
          // Se só tocou sem arrastar
          Animated.timing(waterLevel, {
            toValue: MAX_WATER_LEVEL, // Preenche o copo
            duration: INSTANT_FILL_DURATION,
            useNativeDriver: false,
          }).start(() => {
            setCurrentLevel(MAX_WATER_LEVEL);
            addToHistory(Math.round(MAX_WATER_LEVEL * MAX_ML)); // Salva no histórico
          });
        }
      },
    })
  ).current;

  // Altura animada da água
  const waterHeight = waterLevel.interpolate({
    inputRange: [0, 1], // De 0 a 1
    outputRange: [0, cupHeight * 0.85], // Altura real do copo
  });

  // Cor do texto animada conforme o nível de água
  const waterTextColor = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: ["#4facfe", "#007AFF"],
  });

  const waterAmount = Math.round(currentLevel * MAX_ML); // Quantidade de água em mL

  // ---------------------------
  // Função para beber água
  // ---------------------------
  const handleDrink = () => {
    Animated.timing(waterLevel, {
      toValue: 0, // Reduz para vazio
      duration: 2000,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      setCurrentLevel(0); // Atualiza estado
      addToHistory(waterAmount); // Salva histórico
    });
  };

  // ---------------------------
  // Aplicar valor personalizado digitado
  // ---------------------------
  const handleApplyCustomAmount = () => {
    const ml = Number(String(customAmount).replace(",", "."));
    if (isNaN(ml) || ml <= 0) {
      setIsCustomModalVisible(false);
      return;
    }
    const clampedMl = Math.min(ml, MAX_ML);
    const newLevel = clampedMl / MAX_ML;

    Animated.timing(waterLevel, {
      toValue: newLevel,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentLevel(newLevel);
      setIsCustomModalVisible(false);
    });
  };

  // ---------------------------
  // JSX da tela
  // ---------------------------
  return (
    <View style={styles.container}>
      {/* Quantidade de água (tocável para valor personalizado) */}
      <TouchableOpacity
        onPress={() => {
          setCustomAmount(String(waterAmount));
          setIsCustomModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Animated.Text style={[styles.waterAmountText, { color: waterTextColor }]}>
          {waterAmount} mL
        </Animated.Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {/* Régua lateral */}
        <View style={styles.ruler}>
          {[500, 400, 300, 200, 100, 0].map((mark) => (
            <Text key={mark} style={styles.rulerText}>
              {mark}
            </Text>
          ))}
        </View>

        {/* Copo */}
        <View style={[styles.cup, { width: cupWidth, height: cupHeight }]} {...panResponder.panHandlers}>
          {/* Água animada */}
          <Animated.View style={[styles.water, { height: waterHeight }]}>
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]} // Gradiente azul
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
            {/* Bolhas dentro da água */}
            {bubbles.map((bubble, i) => {
              const sway = bubble.y.interpolate({
                inputRange: [0, cupHeight],
                outputRange: [-bubble.xOffset, bubble.xOffset], // Movimento horizontal suave
              });
              return (
                <Animated.View
                  key={i}
                  style={{
                    position: "absolute",
                    width: bubble.size,
                    height: bubble.size,
                    borderRadius: bubble.size / 2,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    transform: [{ translateY: bubble.y }, { translateX: Animated.add(bubble.baseX, sway) }],
                    opacity: bubble.fade,
                  }}
                />
              );
            })}
          </Animated.View>

          {/* Borda do copo */}
          <View style={styles.cupBorder} pointerEvents="none" />
          <View style={styles.topRim} pointerEvents="none" />
        </View>
      </View>

      {/* Botão de beber */}
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.drinkButton}
      >
        <TouchableOpacity onPress={handleDrink}>
          <Text style={styles.drinkText}>Beber</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Modal para valor personalizado */}
      <Modal
        transparent
        animationType="fade"
        visible={isCustomModalVisible}
        onRequestClose={() => setIsCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Insirir manualmente (mL)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={String(customAmount)}
              onChangeText={setCustomAmount}
              placeholder="Ex: 250"
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity onPress={() => setIsCustomModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApplyCustomAmount}>
                <Text style={styles.modalButtonText}>Aplicar</Text>
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
  container: { flex: 1, backgroundColor: "#E6F0FF", justifyContent: "center", alignItems: "center" }, // Container centralizado
  waterAmountText: { fontSize: 28, fontWeight: "bold", marginBottom: 15, textAlign: "center" }, // Texto da quantidade de água
  cup: {
    // Estilo do copo
    overflow: "hidden",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    transform: [{ scaleX: 1.05 }],
    marginBottom: 30,
  },
  water: { width: "100%", position: "absolute", bottom: 0 }, // Água dentro do copo
  cupBorder: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  }, // Borda do copo
  topRim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  }, // A borda de cima
  drinkButton: { marginTop: 20, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 40 }, // Botão de beber
  drinkText: { color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" }, // Texto do botão
  ruler: { marginRight: 10, height: 300, justifyContent: "space-between" }, // Régua lateral do copo
  rulerText: { fontSize: 14, fontWeight: "bold", color: "#555" }, // Texto da régua

  // Estilos do modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
