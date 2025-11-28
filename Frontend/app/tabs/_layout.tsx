// ---------------------------
// Importando ícones de bibliotecas
// ---------------------------
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"; // Ícones da versão 5 do FontAwesome
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; // Ícones da versão 6 do FontAwesome
import Ionicons from "@expo/vector-icons/Ionicons"; // Ícones do Ionicons
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // Ícones do Material Community

// ---------------------------
// Importando componentes do Expo
// ---------------------------
import { Tabs } from "expo-router"; // Componente para criar abas (navegação tipo "tab bar")

// ---------------------------
// Importando Contextos
// ---------------------------
import { HistoryProvider } from "../context/HistoryContext"; // Contexto global do histórico de água
import { ProfileProvider } from "../context/ProfileContext"; // Contexto global do perfil do usuário

/**
 * Layout principal do aplicativo.
 * Envolve todas as telas nos providers (HistoryProvider e ProfileProvider) 
 * para que todas as abas possam acessar histórico e perfil do usuário de forma global.
 */
export default function TabsLayout() {
  return (
    // Primeiro, o ProfileProvider permite que qualquer tela acesse dados do perfil
    <ProfileProvider>
      {/* Depois, o HistoryProvider permite que qualquer tela acesse o histórico de consumo */}
      <HistoryProvider>
        {/* Componente Tabs cria a barra inferior de navegação entre as telas */}
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "rgba(2, 136, 209, 0.95)", // Cor do ícone ativo
            tabBarInactiveTintColor: "#c3cfe2", // Cor do ícone inativo
            headerShown: false, // Oculta o cabeçalho padrão de cada aba
          }}
        >
          {/* Aba "Beber" */}
          <Tabs.Screen
            name="home" // Nome da tela principal (arquivo index.tsx ou index.jsx)
            options={{
              title: "Beber", // Nome exibido na aba
              tabBarIcon: ({ color }) => ( // Ícone da aba
                <FontAwesome6 name="glass-water" size={24} color={color} />
              ),
            }}
          />

          {/* Aba "Histórico" */}
          <Tabs.Screen
            name="history"
            options={{
              title: "Histórico",
              tabBarIcon: ({ color }) => (
                <FontAwesome5 name="clock" size={24} color={color} />
              ),
            }}
          />

          {/* Aba "Chat" */}
          <Tabs.Screen
            name="chat"
            options={{
              title: "Aqua-Chan",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="chat-outline" size={24} color={color} />
              ),
            }}
          />

          {/* Aba "Missões" */}
          <Tabs.Screen
            name="quest"
            options={{
              title: "Missões",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="email-outline" size={24} color={color} />
              ),
            }}
          />

          {/* Aba "Perfil" */}
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
    </ProfileProvider>
  );
}
