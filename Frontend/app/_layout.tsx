import { Stack } from "expo-router";

/**
 * RootLayout é o componente raiz da navegação do app.
 * Ele define como as telas serão organizadas usando o Stack Navigator.
 */
export default function RootLayout() {
  return (
    <Stack>
      {/*
        Stack.Screen representa uma "tela" dentro do Stack Navigator.
        
        name="(tabs)":
        - Faz referência à tela principal de abas do app.
        - Geralmente corresponde ao arquivo "tabs.tsx" ou pasta "(tabs)".
        
        options={{ headerShown: false }}:
        - Remove o cabeçalho padrão que o Stack Navigator adiciona automaticamente.
        - Isso é útil quando o design da tela já possui um header personalizado ou não precisa de um.
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
