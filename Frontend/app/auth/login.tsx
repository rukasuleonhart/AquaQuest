import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "../services/api";
// Importa o gradiente de fundo do Expo
import { LinearGradient } from "expo-linear-gradient";
// Importa o sistema de navegação do Expo Router
import { router } from "expo-router";
// Importa o React e alguns hooks úteis
import React, { useRef, useState } from "react";
// Importa vários componentes prontos do React Native
import {
  ActivityIndicator, // ícone de carregamento (spinner)
  Animated, // usado para animações
  Dimensions, // obtém as dimensões da tela
  Image, // exibe imagens
  SafeAreaView, // garante que o conteúdo não fique atrás da barra de status
  StyleSheet, // cria estilos
  Text, // texto
  TextInput, // campo de digitação
  TouchableOpacity, // botão que pode ser pressionado
  View, // contêiner para agrupar elementos
} from "react-native";

// ====================
// 🔹 CORES E ÍCONES 🔹
// ====================

// Paleta de cores usada na tela
const COLORS = {
  primary: "#0077B6",
  secondary: "#005F73",
  error: "#EF233C",
  border: "#A9D6E5",
  bgLight: "#E8F7FF",
  bgMedium: "#CAF0F8",
  bgStrong: "#ADE8F4",
  textDark: "#023E8A",
};

// URLs com ícones usados na tela
const ICONS = {
  email: "https://cdn-icons-png.flaticon.com/512/561/561127.png", // ícone de e-mail
  lock: "https://cdn-icons-png.flaticon.com/512/3064/3064155.png", // ícone de cadeado
  error: "https://cdn-icons-png.flaticon.com/512/1828/1828778.png", // ícone de erro
  eye: "https://cdn-icons-png.flaticon.com/512/159/159607.png", // olho aberto
  eyeClosed: "https://cdn-icons-png.flaticon.com/512/159/159604.png", // olho fechado
  logo: "https://cdn-icons-png.flaticon.com/512/2910/2910768.png", // logo fictício
};

// Pega a largura da tela (usada para ajustar tamanhos automaticamente)
const { width } = Dimensions.get("window");

// =====================================================
// 🔹 COMPONENTE DE INPUT PERSONALIZADO (REUTILIZÁVEL) 🔹
// =====================================================

// Define o formato (interface) das propriedades que o campo de entrada pode receber
interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean; // se é campo de senha
  keyboardType?: "default" | "email-address"; // tipo de teclado
  iconUri: string; // ícone mostrado à esquerda
  isError?: boolean; // mostra erro se verdadeiro
  toggleSecure?: () => void; // função para mostrar/ocultar senha
  autoFocus?: boolean; // foco automático
}

// Função que define como o campo de entrada será renderizado
const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  iconUri,
  isError,
  toggleSecure,
  autoFocus = false,
}: InputProps) => (
  <View style={styles.inputContainer}>
    {/* Ícone à esquerda do campo */}
    <Image source={{ uri: iconUri }} style={styles.inputIcon} />

    {/* Campo de texto */}
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#777"
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry} // esconde o texto (para senhas)
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      autoCapitalize="none"
      accessibilityLabel={placeholder}
      accessibilityHint={`Digite seu ${placeholder.toLowerCase()}`}
      style={[
        styles.input,
        { borderColor: isError ? COLORS.error : COLORS.border }, // muda a cor da borda se tiver erro
        toggleSecure && { paddingRight: 50 }, // adiciona espaço extra se tiver o botão do olho
      ]}
    />

    {/* Ícone de erro, se houver */}
    {isError && <Image source={{ uri: ICONS.error }} style={styles.errorIcon} />}

    {/* Botão para mostrar ou ocultar senha */}
    {toggleSecure && (
      <TouchableOpacity
        onPress={toggleSecure}
        accessibilityLabel="Alternar visibilidade da senha"
        style={styles.toggleIconContainer}
      >
        <Image
          source={{
            uri: secureTextEntry ? ICONS.eyeClosed : ICONS.eye,
          }}
          style={styles.toggleIcon}
        />
      </TouchableOpacity>
    )}
  </View>
);

// ==================================
// 🔹 TELA PRINCIPAL DE LOGIN 🔹
// ==================================

export default function LoginScreen() {
  // Estados que guardam os valores dos campos e status da tela
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true); // controla se a senha está visível
  const [errors, setErrors] = useState({ email: false, password: false }); // erros de validação
  const [loading, setLoading] = useState(false); // indica se está carregando

  // Cria uma referência para animações
  const scale = useRef(new Animated.Value(1)).current;

  // Função simples para validar o formato do e-mail
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  // Anima o botão (faz um pequeno "zoom" ao clicar)
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95, // diminui
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1, // volta ao normal
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Função chamada ao clicar no botão "Entrar"
  const handleLogin = async () => {
  setErrors({ email: false, password: false });
  setLoading(true);

  const emailError = !email || !isValidEmail(email);
  const passwordError = !password;
  if (emailError || passwordError) {
    setErrors({ email: emailError, password: passwordError });
    setLoading(false);
    return;
  }

  try {
    // Cria um form para enviar como x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("username", email); // usar email como username, de acordo com o backend
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    await AsyncStorage.setItem("token", response.data.access_token);

    // Configura o header Authorization para requisições futuras
    api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;

    setLoading(false);
    router.replace("/tabs/home");
  } catch (error) {
    setLoading(false);
    const err = error;
    if (err.response?.data?.detail) {
      setErrors({ email: true, password: true });
    } else {
      setErrors({ email: false, password: false });
      // Mensagem de falha de conexão pode ser exibida
    }
  }
};


  // ===========================================
  // 🔹 RETORNO VISUAL (O QUE É EXIBIDO NA TELA)
  // ===========================================
  return (
    <SafeAreaView style={styles.container}>
      {/* Fundo com gradiente de cores */}
      <LinearGradient
        colors={[COLORS.bgLight, COLORS.bgMedium, COLORS.bgStrong]}
        style={styles.gradient}
      >
        {/* Logo e título */}
        <Image source={{ uri: ICONS.logo }} style={styles.logo} />
        <Text style={styles.title}>AquaQuest 💧</Text>

        {/* Campo de email */}
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: false }));
          }}
          keyboardType="email-address"
          iconUri={ICONS.email}
          isError={errors.email}
          autoFocus
        />

        {/* Campo de senha */}
        <InputField
          placeholder="Senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: false }));
          }}
          secureTextEntry={secure}
          iconUri={ICONS.lock}
          isError={errors.password}
          toggleSecure={() => setSecure((prev) => !prev)} // alterna visibilidade da senha
        />

        {/* Botão de login com animação */}
        <Animated.View style={{ transform: [{ scale }], width: "100%" }}>
          <TouchableOpacity
            onPress={() => {
              animateButton();
              handleLogin();
            }}
            activeOpacity={0.8}
            style={[styles.button, loading && { backgroundColor: COLORS.secondary }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" /> // mostra o spinner
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Link para cadastro */}
        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          style={styles.registerContainer}
        >
          <Text style={styles.linkText}>Criar uma conta</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ==========================
// 🔹 ESTILOS DA TELA 🔹
// ==========================
const styles = StyleSheet.create({
  container: { flex: 1 }, // ocupa a tela inteira
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.08, // margens laterais proporcionais à tela
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: { width: "100%", marginBottom: 15, position: "relative" },
  input: {
    backgroundColor: "#fff",
    paddingLeft: 50,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // sombra no Android
  },
  inputIcon: {
    width: 20,
    height: 20,
    position: "absolute",
    left: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
    opacity: 0.6,
  },
  errorIcon: {
    width: 20,
    height: 20,
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  toggleIconContainer: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -12.5 }],
  },
  toggleIcon: { width: 25, height: 25, opacity: 0.6 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerContainer: { marginTop: 20, padding: 10 },
  linkText: { color: COLORS.primary, fontWeight: "500", fontSize: 16 },
});
