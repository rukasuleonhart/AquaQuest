import { MaterialCommunityIcons } from "@expo/vector-icons"; // Ícones bonitos
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  isError?: boolean;
  toggleSecure?: () => void;
  autoFocus?: boolean;
  leftIcon?: JSX.Element;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

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
  autoCapitalize = "none",
}: InputProps) => (
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
      autoCapitalize={autoCapitalize}
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
        activeOpacity={0.7}
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setFieldErrors({
      name: false,
      email: false,
      password: false,
      confirmPassword: false,
    });

    const newErrors = {
      name: !name,
      email: !email,
      password: !password,
      confirmPassword: !confirmPassword,
    };

    if (Object.values(newErrors).some(Boolean)) {
      setFieldErrors(newErrors);
      setError("Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        password: true,
        confirmPassword: true,
      }));
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users", {
        name,
        email,
        password,
      });

      setLoading(false);

      if (response.status === 200 || response.status === 201) {
        router.replace("/auth/login");
      } else {
        setError(response.data.detail || "Erro ao cadastrar.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.detail || "Erro de conexão.");
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
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Comece sua jornada de hidratação 💧</Text>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <InputField
          placeholder="Nome"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setFieldErrors((prev) => ({ ...prev, name: false }));
          }}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#555"
            />
          }
          isError={fieldErrors.name}
          autoCapitalize="words"
          autoFocus
        />

        <InputField
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setFieldErrors((prev) => ({ ...prev, email: false }));
          }}
          keyboardType="email-address"
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#555"
            />
          }
          isError={fieldErrors.email}
        />

        <InputField
          placeholder="Senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setFieldErrors((prev) => ({ ...prev, password: false }));
          }}
          secureTextEntry={secure}
          isError={fieldErrors.password}
          toggleSecure={() => setSecure((prev) => !prev)}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#555"
            />
          }
        />

        <InputField
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setFieldErrors((prev) => ({ ...prev, confirmPassword: false }));
          }}
          secureTextEntry={secureConfirm}
          isError={fieldErrors.confirmPassword}
          toggleSecure={() => setSecureConfirm((prev) => !prev)}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={22}
              color="#555"
            />
          }
        />

        <TouchableOpacity
          onPress={handleRegister}
          activeOpacity={0.9}
          style={{ width: "100%" }}
        >
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          activeOpacity={0.7}
          style={styles.loginLinkContainer}
        >
          <Text style={styles.loginLinkText}>
            Já tem uma conta? Faça login
          </Text>
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

  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  loginLinkContainer: { marginTop: 18, padding: 8 },
  loginLinkText: { color: COLORS.primary, fontWeight: "500", fontSize: 16 },
});
