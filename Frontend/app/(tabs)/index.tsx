// ---------------------------
// Importações
// ---------------------------
import { LinearGradient } from "expo-linear-gradient"; // Gradientes lineares
import React, { useEffect, useRef, useState } from "react"; // React e hooks
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // Componentes e animações do React Native
import { useHistory } from "../context/HistoryContext"; // Hook do contexto global de histórico

// ---------------------------
// Constantes da tela
// ---------------------------
const { height: SCREEN_HEIGHT } = Dimensions.get("window"); // Altura da tela

const MAX_WATER_LEVEL = 1; // Nível máximo do copo (100%)
const MIN_WATER_LEVEL = 0; // Nível mínimo do copo (vazio)

// ---------------------------
// Componente principal da tela de consumo interativo
// ---------------------------
export default function Index() {
  const { addToHistory } = useHistory(); // Função para adicionar histórico global

  // Referência animada do nível de água
  const waterLevel = useRef(new Animated.Value(0.8)).current;
  // Estado local do nível de água atual
  const [currentLevel, setCurrentLevel] = useState(0.8);
  // Armazena o nível de água no início do gesto
  const gestureStartLevel = useRef(0);

  // Configurações de UI
  const INSTANT_FILL_DURATION = 300; // Duração do enchimento instantâneo
  const cupWidth = 150; // Largura do copo
  const cupHeight = 300; // Altura do copo

  // ---------------------------
  // Criação das bolhas animadas
  // ---------------------------
  const bubbleCount = 8;
  const bubbles = useRef(
    Array.from({ length: bubbleCount }).map(() => ({
      y: new Animated.Value(cupHeight * Math.random() * 0.85), // posição vertical inicial
      xOffset: Math.random() * 20 - 10, // oscilação horizontal
      baseX: Math.random() * cupWidth * 0.7 + 20, // posição horizontal base
      size: 4 + Math.random() * 12, // tamanho da bolha
      speed: 2000 + Math.random() * 2000, // velocidade da animação
      fade: new Animated.Value(0), // opacidade da bolha
    }))
  ).current;

  // ---------------------------
  // Efeito para animar bolhas continuamente
  // ---------------------------
  useEffect(() => {
    bubbles.forEach((bubble) => {
      const animate = () => {
        bubble.y.setValue(cupHeight * 0.85);
        bubble.fade.setValue(0);

        Animated.parallel([
          // Movimento vertical
          Animated.timing(bubble.y, {
            toValue: 0,
            duration: bubble.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Animação de fade (aparecer/desaparecer)
          Animated.sequence([
            Animated.timing(bubble.fade, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(bubble.fade, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]).start(() => animate()); // Repetir continuamente
      };
      animate();
    });
  }, []);

  // ---------------------------
  // Configuração do gesto de arrastar para encher/esvaziar o copo
  // ---------------------------
  const panResponder = useRef(
    PanResponder.create({
      // Ativar gesto
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,

      // Armazenar nível inicial no início do gesto
      onPanResponderGrant: () => {
        waterLevel.stopAnimation((value) => {
          gestureStartLevel.current = value;
        });
      },

      // Atualizar nível de água durante o arrasto
      onPanResponderMove: (_, g) => {
        const sensitivity = 200;
        let newLevel = gestureStartLevel.current - g.dy / sensitivity;
        newLevel = Math.min(Math.max(newLevel, MIN_WATER_LEVEL), MAX_WATER_LEVEL);
        waterLevel.setValue(newLevel);
        setCurrentLevel(newLevel);
      },

      // Encher instantaneamente se toque curto
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dy) < 5) {
          Animated.timing(waterLevel, {
            toValue: MAX_WATER_LEVEL,
            duration: INSTANT_FILL_DURATION,
            useNativeDriver: false,
          }).start(() => {
            setCurrentLevel(MAX_WATER_LEVEL);
            addToHistory("Encheu", Math.round(MAX_WATER_LEVEL * 500));
          });
        }
      },
    })
  ).current;

  // ---------------------------
  // Interpolação para altura do copo e cor do texto
  // ---------------------------
  const waterHeight = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cupHeight * 0.85],
  });

  const waterTextColor = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: ["#4facfe", "#007AFF"], // Azul claro -> Azul forte
  });

  const waterAmount = Math.round(currentLevel * 500); // Conversão para mL

  // ---------------------------
  // Função para beber água (esvaziar copo)
  // ---------------------------
  const handleDrink = () => {
    Animated.timing(waterLevel, {
      toValue: 0,
      duration: 2000,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      setCurrentLevel(0);
      addToHistory("Bebeu", waterAmount);
    });
  };

  // ---------------------------
  // Render da UI
  // ---------------------------
  return (
    <View style={styles.container}>
      {/* Texto animado com quantidade de água */}
      <Animated.Text style={[styles.waterAmountText, { color: waterTextColor }]}>
        {waterAmount} mL
      </Animated.Text>

      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {/* Régua lateral com marcações */}
        <View style={styles.ruler}>
          {[500, 400, 300, 200, 100, 0].map((mark) => (
            <Text key={mark} style={styles.rulerText}>
              {mark}
            </Text>
          ))}
        </View>

        {/* Copo com gesto e água animada */}
        <View style={[styles.cup, { width: cupWidth, height: cupHeight }]} {...panResponder.panHandlers}>
          <Animated.View style={[styles.water, { height: waterHeight }]}>
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
            {/* Render das bolhas */}
            {bubbles.map((bubble, i) => {
              const sway = bubble.y.interpolate({
                inputRange: [0, cupHeight],
                outputRange: [-bubble.xOffset, bubble.xOffset],
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

          {/* Bordas do copo */}
          <View style={styles.cupBorder} pointerEvents="none" />
          <View style={styles.topRim} pointerEvents="none" />
        </View>
      </View>

      {/* Botão beber água */}
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
    </View>
  );
}

// ---------------------------
// Estilos
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F0FF", justifyContent: "center", alignItems: "center" },
  waterAmountText: { fontSize: 28, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  cup: {
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
  water: { width: "100%", position: "absolute", bottom: 0 },
  cupBorder: { ...StyleSheet.absoluteFillObject, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 3, borderColor: "rgba(255,255,255,0.6)" },
  topRim: { position: "absolute", top: 0, left: 0, right: 0, height: 18, backgroundColor: "rgba(255,255,255,0.25)", borderBottomWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  drinkButton: { marginTop: 20, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 40 },
  drinkText: { color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  ruler: { marginRight: 10, height: 300, justifyContent: "space-between" },
  rulerText: { fontSize: 14, fontWeight: "bold", color: "#555" },
});