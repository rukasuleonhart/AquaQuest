import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Importa o hook para salvar histórico de hidratação
import { useHistory } from "../context/HistoryContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Valores máximos e mínimos para o nível de água
const MAX_WATER_LEVEL = 1;
const MIN_WATER_LEVEL = 0;

/**
 * Componente principal da tela de ingestão de água.
 * Mostra um copo animado com água e bolhas, permite interagir por gestos
 * e registra ações de beber ou encher no histórico.
 */
export default function Index() {
  const { addToHistory } = useHistory(); // Função para salvar histórico

  // Nível de água (valor animado)
  const waterLevel = useRef(new Animated.Value(0.8)).current; // começa quase cheio
  const [currentLevel, setCurrentLevel] = useState(0.8);
  const gestureStartLevel = useRef(0); // armazena nível no início do gesto
  const INSTANT_FILL_DURATION = 300; // tempo de animação de preenchimento instantâneo
  const cupWidth = 150; // largura do copo
  const cupHeight = 300; // altura do copo

  // Configuração das bolhas
  const bubbleCount = 6;
  const bubbles = Array.from({ length: bubbleCount }).map(() => ({
    y: new Animated.Value(Math.random() * cupHeight * 0.85), // posição vertical inicial
    x: Math.random() * cupWidth * 0.7 + 20, // posição horizontal
    size: 6 + Math.random() * 10, // tamanho da bolha
    delay: Math.random() * 1000, // atraso inicial da animação
  }));

  // Efeito para animar as bolhas continuamente
  useEffect(() => {
    bubbles.forEach((bubble) => {
      const animate = () => {
        bubble.y.setValue(cupHeight * 0.85);
        Animated.timing(bubble.y, {
          toValue: 0,
          duration: 2500 + Math.random() * 2500,
          delay: bubble.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => animate());
      };
      animate();
    });
  }, []);

  // PanResponder para detectar gestos de encher/esvaziar o copo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5, // inicia quando o gesto é vertical
      onPanResponderGrant: () => {
        // Armazena o nível atual no início do gesto
        waterLevel.stopAnimation((value) => {
          gestureStartLevel.current = value;
        });
      },
      onPanResponderMove: (_, g) => {
        // Atualiza nível de água conforme arrasto vertical
        const sensitivity = 200;
        let newLevel = gestureStartLevel.current - g.dy / sensitivity;
        newLevel = Math.min(Math.max(newLevel, MIN_WATER_LEVEL), MAX_WATER_LEVEL);
        waterLevel.setValue(newLevel);
        setCurrentLevel(newLevel);
      },
      onPanResponderRelease: (_, g) => {
        // Se toque rápido, enche instantaneamente
        if (Math.abs(g.dy) < 5) {
          Animated.timing(waterLevel, {
            toValue: MAX_WATER_LEVEL,
            duration: INSTANT_FILL_DURATION,
            useNativeDriver: false,
          }).start(() => {
            setCurrentLevel(MAX_WATER_LEVEL);
            addToHistory("Encheu", Math.round(MAX_WATER_LEVEL * 500)); // salva no histórico
          });
        }
      },
    })
  ).current;

  // Interpolação para altura e cor da água
  const waterHeight = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cupHeight * 0.85],
  });
  const waterColor = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,122,255,0.25)", "rgba(0,122,255,0.9)"],
  });

  // Cor do texto indicando a quantidade de água
  const waterTextColor = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,122,255,0.25)", "rgba(0,122,255,0.9)"],
  });

  const waterAmount = Math.round(currentLevel * 500); // converte nível em mL

  // Função para beber (esvaziar copo)
  const handleDrink = () => {
    Animated.timing(waterLevel, {
      toValue: 0,
      duration: 2000, // 2s para esvaziar
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      setCurrentLevel(0);
      addToHistory("Bebeu", waterAmount); // salva histórico
    });
  };

  return (
    <View style={styles.container}>
      {/* Quantidade em ML acima do copo */}
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

        {/* Copo */}
        <View style={[styles.cup, { width: cupWidth, height: cupHeight }]} {...panResponder.panHandlers}>
          {/* Água animada */}
          <Animated.View style={[styles.water, { height: waterHeight, backgroundColor: waterColor }]}>
            {/* Bolhas animadas */}
            {bubbles.map((bubble, i) => (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: bubble.size / 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  transform: [{ translateY: bubble.y }, { translateX: bubble.x }],
                }}
              />
            ))}
          </Animated.View>

          {/* Reflexos e bordas do copo */}
          <View style={styles.reflexLeft} pointerEvents="none" />
          <View style={styles.reflexRight} pointerEvents="none" />
          <View style={styles.cupBorder} pointerEvents="none" />
          <View style={styles.topRim} pointerEvents="none" />
        </View>
      </View>

      {/* Botão Beber */}
      <AnimatedTouchable style={[styles.drinkButton, { backgroundColor: waterColor }]} onPress={handleDrink}>
        <Text style={styles.drinkText}>Beber</Text>
      </AnimatedTouchable>
    </View>
  );
}

// Touchable animado para acompanhar cor da água
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  waterAmountText: { fontSize: 28, fontWeight: "bold", marginBottom: 15 },
  cup: {
    overflow: "hidden",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    transform: [{ scaleX: 1.05 }],
    marginBottom: 30,
  },
  water: { width: "100%", position: "absolute", bottom: 0 },
  cupBorder: { ...StyleSheet.absoluteFillObject, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 3, borderColor: "rgba(255,255,255,0.6)" },
  topRim: { position: "absolute", top: 0, left: 0, right: 0, height: 18, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: "rgba(255,255,255,0.25)", borderBottomWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  reflexLeft: { position: "absolute", left: 15, top: 30, bottom: 30, width: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.35)" },
  reflexRight: { position: "absolute", right: 15, top: 50, bottom: 50, width: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.25)" },
  drinkButton: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  drinkText: { color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  ruler: { marginRight: 10, height: 300, justifyContent: "space-between" },
  rulerText: { fontSize: 14, fontWeight: "bold", color: "#555" },
});
