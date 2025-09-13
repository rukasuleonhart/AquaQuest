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
// Tabs: componente que cria navegação por abas (bottom tabs)
import { Tabs } from "expo-router";

// ---------------------------
// Importando Contextos
// ---------------------------
// HistoryProvider: provedor global que gerencia o histórico de consumo de água
import { HistoryProvider } from "../context/HistoryContext";

/**
 * Layout principal do aplicativo.
 * Envolve todas as telas no HistoryProvider para que possam acessar
 * o histórico global e configura as abas da navegação.
 */
export default function TabsLayout() {
  return (
    // Contexto global que disponibiliza o histórico para todas as telas
    <HistoryProvider>
      <Tabs
        screenOptions={{
          // Cor dos ícones das abas quando estão ativas
          tabBarActiveTintColor: "rgba(2, 136, 209, 0.95)",
          // Cor dos ícones quando inativas
          tabBarInactiveTintColor: "#c3cfe2",
          // Oculta o cabeçalho padrão de todas as telas
          headerShown: false,
        }}
      >
        {/* ---------------------------
            Aba "Beber" - Tela principal
            --------------------------- */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Beber",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="glass-water" size={24} color={color} />
            ),
          }}
        />

        {/* ---------------------------
            Aba "Histórico"
            --------------------------- */}
        <Tabs.Screen
          name="history"
          options={{
            title: "Histórico",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="clock" size={24} color={color} />
            ),
          }}
        />

        {/* ---------------------------
            Aba "Chat"
            --------------------------- */}
        <Tabs.Screen
          name="chat"
          options={{
            title: "Aqua-Chan",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="chat-outline" size={24} color={color} />
            ),
          }}
        />

        {/* ---------------------------
            Aba "Missões"
            --------------------------- */}
        <Tabs.Screen
          name="quest"
          options={{
            title: "Missões",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="sword" size={24} color={color} />
            ),
          }}
        />

        {/* ---------------------------
            Aba "Perfil"
            --------------------------- */}
        <Tabs.Screen
          name="profile"
          options={{
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
