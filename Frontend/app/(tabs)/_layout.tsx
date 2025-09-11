// Importando ícones das bibliotecas do Expo Vector Icons
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"; // Ýcones da versão 5 do FontAwesome
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Ýcones da versão 6 do FontAwesome
import Ionicons from "@expo/vector-icons/Ionicons"; // Ýcones da biblioteca Ionicons
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // Ýcones da MaterialCommunity

// Importando o componente de navegação em abas do Expo Router
import { Tabs } from "expo-router";

// Importando o provider de histórico, que provavelmente gerencia o estado global do histórico de ações do usuário
import { HistoryProvider } from "../context/HistoryContext";

/**
 * Componente principal de layout de abas do aplicativo.
 * Ele envolve todas as telas com o HistoryProvider para fornecer
 * o contexto de histórico em qualquer tela filha.
 */
export default function TabsLayout() {
  return (
    // Envolvendo as abas com o HistoryProvider para disponibilizar
    // o contexto global de histórico em todas as telas
    <HistoryProvider>
      <Tabs
        screenOptions={{
          // Cor do ícone ativo da aba
          tabBarActiveTintColor: "rgba(2, 136, 209, 0.95)",
          // Cor do ícone inativo da aba
          tabBarInactiveTintColor: "#c3cfe2",
        }}
      >
        {/* Tela principal - Aba "Beber" */}
        <Tabs.Screen
          name="index" // Nome da rota
          options={{
            headerShown: false,
            title: "Beber", // Título exibido na aba
            tabBarIcon: ({ color }) => (
              // Ýcone da aba, que muda de cor dependendo do estado (ativo/inativo)
              <FontAwesome6 name="glass-water" size={24} color={color} />
            ),
          }}
        />

        {/* Tela de histórico - Aba "Historico" */}
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

        {/* Tela de missões - Aba "Missões" */}
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

        {/* Tela de perfil - Aba "Perfil" */}
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
