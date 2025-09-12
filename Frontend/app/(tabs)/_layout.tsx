// ---------------------------
// Importando ícones de bibliotecas populares
// ---------------------------
// FontAwesome5: biblioteca de ícones FontAwesome versão 5
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
// FontAwesome6: biblioteca de ícones FontAwesome versão 6
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// Ionicons: biblioteca de ícones da Ionicons
import Ionicons from "@expo/vector-icons/Ionicons";
// MaterialCommunityIcons: ícones da Material Design Community
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// ---------------------------
// Importando componentes do Expo
// ---------------------------
// Componente de navegação em abas do Expo Router
import { Tabs } from "expo-router";

// ---------------------------
// Importando Contextos
// ---------------------------
// HistoryProvider: provedor de contexto que gerencia o histórico
// de ações do usuário e disponibiliza esse estado globalmente
import { HistoryProvider } from "../context/HistoryContext";

/**
 * Componente principal de layout com abas do aplicativo.
 * Ele envolve todas as telas com o HistoryProvider, permitindo que
 * qualquer tela filha acesse o contexto de histórico.
 */
export default function TabsLayout() {
  return (
    // HistoryProvider fornece o estado global de histórico
    <HistoryProvider>
      <Tabs
        screenOptions={{
          // Define a cor do ícone da aba quando está ativa
          tabBarActiveTintColor: "rgba(2, 136, 209, 0.95)",
          // Define a cor do ícone da aba quando está inativa
          tabBarInactiveTintColor: "#c3cfe2",
        }}
      >
        {/* ---------------------------
            Aba "Beber" - Tela principal
            --------------------------- */}
        <Tabs.Screen
          name="index" // Nome da rota (usado pelo router)
          options={{
            headerShown: false, // Esconde o cabeçalho da tela
            title: "Beber",     // Título exibido na aba
            tabBarIcon: ({ color }) => (
              // Ícone da aba que muda de cor conforme estado (ativo/inativo)
              <FontAwesome6 name="glass-water" size={24} color={color} />
            ),
          }}
        />

        {/* ---------------------------
            Aba "Historico" - Tela de histórico
            --------------------------- */}
        <Tabs.Screen
          name="history"
          options={{
            headerShown: false,
            title: "Historico",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="clock" size={24} color={color} />
            ),
          }}
        />
        {/* ---------------------------
            Aba "Chat" - Tela do chat
            --------------------------- */}
        <Tabs.Screen
          name="chat"
          options={{
            headerShown: false,
            title: "Aqua-Chan",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="chat-outline" size={24} color={color} />
            ),
          }}
        />
        {/* ---------------------------
            Aba "Missões" - Tela de missões
            --------------------------- */}
        <Tabs.Screen
          name="quest"
          options={{
            headerShown: false,
            title: "Missões",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="sword" size={24} color={color} />
            ),
          }}
        />

        {/* ---------------------------
            Aba "Perfil" - Tela de perfil
            --------------------------- */}
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </HistoryProvider>
  );
}
