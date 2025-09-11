import { LinearGradient } from "expo-linear-gradient";
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
import { useHistory } from "../context/HistoryContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAX_WATER_LEVEL = 1;
const MIN_WATER_LEVEL = 0;

export default function Index() {
  const { addToHistory } = useHistory();

  const waterLevel = useRef(new Animated.Value(0.8)).current;
  const [currentLevel, setCurrentLevel] = useState(0.8);
  const gestureStartLevel = useRef(0);
  const INSTANT_FILL_DURATION = 300;
  const cupWidth = 150;
  const cupHeight = 300;

  const bubbleCount = 8;
  const bubbles = useRef(
    Array.from({ length: bubbleCount }).map(() => ({
      y: new Animated.Value(cupHeight * Math.random() * 0.85),
      xOffset: Math.random() * 20 - 10,
      baseX: Math.random() * cupWidth * 0.7 + 20,
      size: 4 + Math.random() * 12,
      speed: 2000 + Math.random() * 2000,
      fade: new Animated.Value(0),
    }))
  ).current;

  // Animação bolhas
  useEffect(() => {
    bubbles.forEach((bubble) => {
      const animate = () => {
        bubble.y.setValue(cupHeight * 0.85);
        bubble.fade.setValue(0);
        Animated.parallel([
          Animated.timing(bubble.y, {
            toValue: 0,
            duration: bubble.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(bubble.fade, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(bubble.fade, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]).start(() => animate());
      };
      animate();
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        waterLevel.stopAnimation((value) => {
          gestureStartLevel.current = value;
        });
      },
      onPanResponderMove: (_, g) => {
        const sensitivity = 200;
        let newLevel = gestureStartLevel.current - g.dy / sensitivity;
        newLevel = Math.min(Math.max(newLevel, MIN_WATER_LEVEL), MAX_WATER_LEVEL);
        waterLevel.setValue(newLevel);
        setCurrentLevel(newLevel);
      },
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

  const waterHeight = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cupHeight * 0.85],
  });

  // Simulação de gradiente com Animated.Text (de azul claro para azul forte)
  const waterTextColor = waterLevel.interpolate({
    inputRange: [0, 1],
    outputRange: ["#4facfe", "#007AFF"],
  });

  const waterAmount = Math.round(currentLevel * 500);

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

  return (
    <View style={styles.container}>
      {/* Texto com cor animada */}
      <Animated.Text style={[styles.waterAmountText, { color: waterTextColor }]}>
        {waterAmount} mL
      </Animated.Text>

      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <View style={styles.ruler}>
          {[500, 400, 300, 200, 100, 0].map((mark) => (
            <Text key={mark} style={styles.rulerText}>
              {mark}
            </Text>
          ))}
        </View>

        {/* Copo com gradiente */}
        <View style={[styles.cup, { width: cupWidth, height: cupHeight }]} {...panResponder.panHandlers}>
          <Animated.View style={[styles.water, { height: waterHeight }]}>
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
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

          <View style={styles.cupBorder} pointerEvents="none" />
          <View style={styles.topRim} pointerEvents="none" />
        </View>
      </View>

      {/* Botão com gradiente */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  waterAmountText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
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
  cupBorder: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  topRim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderBottomWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  drinkButton: {
    marginTop: 20,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  drinkText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  ruler: { marginRight: 10, height: 300, justifyContent: "space-between" },
  rulerText: { fontSize: 14, fontWeight: "bold", color: "#555" },
});
