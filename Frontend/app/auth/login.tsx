import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";

const COLORS = {
  primary: "#007AFF",
  error: "#B00020",
  border: "#B8C8E8",
  bg: "#E8F0FF",
  textDark: "#012A6C",
};

const { width } = Dimensions.get("window");

// Componente de Input PADRONIZADO com o da tela de registro
const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  isError,
  toggleSecure,
  autoFocus = false,
  leftIcon,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  isError?: boolean;
  toggleSecure?: () => void;
  autoFocus?: boolean;
  leftIcon?: JSX.Element;
}) => (
  <View style={styles.inputContainer}>
    {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#777"
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      autoCapitalize="none"
      style={[
        styles.input,
        {
          borderColor: isError ? COLORS.error : COLORS.border,
          paddingLeft: leftIcon ? 48 : 16,
        },
        toggleSecure && { paddingRight: 50 },
      ]}
    />

    {toggleSecure && (
      <TouchableOpacity
        onPress={toggleSecure}
        style={styles.toggleIconContainer}
      >
        <MaterialCommunityIcons
          name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
          size={24}
          color="#555"
        />
      </TouchableOpacity>
    )}
  </View>
);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [errors, setErrors] = useState({ email: false, password: false });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    setErrors({ email: false, password: false });
    setFormError("");

    const emailError = !email || !isValidEmail(email);
    const passwordError = !password;

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setFormError("Verifique seu email e senha.");
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await AsyncStorage.setItem("token", response.data.access_token);
      api.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.access_token}`;

      setLoading(false);
      router.replace("/tabs/home");
    } catch (error: any) {
      setLoading(false);
      setErrors({ email: true, password: true });
      setFormError(
        error.response?.data?.detail
          ? "Email ou senha inválidos."
          : "Erro de conexão. Tente novamente."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.bg, "#d5e5ff", "#bfd4ff"]}
        style={styles.gradient}
      >
        <MaterialCommunityIcons
          name="water-circle"
          size={80}
          color={COLORS.primary}
          style={{ marginBottom: 10 }}
        />

        <Text style={styles.appName}>AquaQuest</Text>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Continue sua jornada 💧</Text>

        {formError !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        )}

        {/* EMAIL */}
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setErrors((prev) => ({ ...prev, email: false }));
          }}
          keyboardType="email-address"
          isError={errors.email}
          autoFocus
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#555"
            />
          }
        />

        {/* SENHA */}
        <InputField
          placeholder="Senha"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrors((prev) => ({ ...prev, password: false }));
          }}
          secureTextEntry={secure}
          isError={errors.password}
          toggleSecure={() => setSecure((prev) => !prev)}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#555"
            />
          }
        />

        <Animated.View style={{ transform: [{ scale }], width: "100%" }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              animateButton();
              handleLogin();
            }}
          >
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={styles.registerContainer}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>Criar uma conta</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
  },

  appName: {
    fontSize: 16,
    color: COLORS.textDark,
    opacity: 0.9,
    marginBottom: 2,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },

  errorBox: {
    width: "100%",
    backgroundColor: "#FFE5E9",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  errorText: {
    color: COLORS.error,
    textAlign: "center",
    fontSize: 14,
  },

  inputContainer: {
    width: "100%",
    marginBottom: 14,
    position: "relative",
  },

  input: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1.5,
  },

  leftIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -11 }],
    opacity: 0.7,
  },

  toggleIconContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
  },

  buttonGradient: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  registerContainer: { marginTop: 18, padding: 8 },
  linkText: { color: COLORS.primary, fontWeight: "500", fontSize: 16 },
});
