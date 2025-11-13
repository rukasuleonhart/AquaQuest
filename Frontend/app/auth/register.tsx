import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/auth/login");
    }, 900);
  };

  return (
    <LinearGradient
      colors={["#E8F7FF", "#caf0f8", "#ade8f4"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 }}
    >
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/2910/2910768.png" }}
        style={{ width: 120, height: 120, marginBottom: 16 }}
      />

      <Text style={{ fontSize: 18, color: "#0077B6", marginBottom: 6 }}>Vamos começar!</Text>
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#0077B6", marginBottom: 10 }}>
        Crie sua conta 💧
      </Text>

      <View style={{ width: "100%", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Nome"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 15,
              fontSize: 16,
              borderWidth: 1.5,
              borderColor: error ? "#EF233C" : "#A9D6E5",
              marginRight: 10,
            }}
            autoCapitalize="words"
          />
          <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/747/747376.png" }}
            style={{ width: 25, height: 25, opacity: 0.7 }} 
          />
        </View>
      </View>

      <View style={{ width: "100%", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 15,
              fontSize: 16,
              borderWidth: 1.5,
              borderColor: error ? "#EF233C" : "#A9D6E5",
              marginRight: 10,
            }}
            autoCapitalize="none"
          />
          <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/484/484167.png" }}
            style={{ width: 25, height: 25, opacity: 0.6 }} 
          />
        </View>
      </View>

      <View style={{ width: "100%", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#777"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 15,
              fontSize: 16,
              borderWidth: 1.5,
              borderColor: error ? "#EF233C" : "#A9D6E5",
              marginRight: 10,
            }}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Image source={{
              uri: secure
                ? "https://cdn-icons-png.flaticon.com/512/565/565547.png"
                : "https://cdn-icons-png.flaticon.com/512/565/565422.png"
            }}
              style={{ width: 25, height: 25, opacity: 0.6 }} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ width: "100%", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="Confirmar senha"
            placeholderTextColor="#777"
            secureTextEntry={secureConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 15,
              fontSize: 16,
              borderWidth: 1.5,
              borderColor: error ? "#EF233C" : "#A9D6E5",
              marginRight: 10,
            }}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
            <Image source={{
              uri: secureConfirm
                ? "https://cdn-icons-png.flaticon.com/512/565/565547.png"
                : "https://cdn-icons-png.flaticon.com/512/565/565422.png"
            }}
              style={{ width: 25, height: 25, opacity: 0.6 }} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {error !== "" && (
        <Text style={{ color: "#EF233C", fontSize: 15, marginBottom: 5 }}>{error}</Text>
      )}

      <TouchableOpacity
        onPress={handleRegister}
        activeOpacity={0.8}
        style={{
          backgroundColor: "#0077B6",
          paddingVertical: 15,
          borderRadius: 15,
          width: "100%",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        {loading ?
          <ActivityIndicator color="#fff" />
          :
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Cadastrar</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/auth/login")}
        activeOpacity={0.7}
        style={{
          marginTop: 6,
          padding: 8,
        }}
      >
        <Text style={{ color: "#0077B6", fontWeight: "500", fontSize: 16 }}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
