import { Stack } from "expo-router";

/**
 * RootLayout é o componente raiz da navegação do app.
 * Ele usa Stack Navigator do Expo Router para organizar as telas.
 * 
 * No caso, ele renderiza apenas a tela principal de abas "(tabs)".
 */
export default function RootLayout() {
  return (
    <Stack>
      {/* 
        Tela principal de abas do app.
        name="(tabs)" corresponde ao arquivo de rotas "tabs.tsx" ou pasta "(tabs)".
        headerShown: false -> remove o cabeçalho padrão do Stack Navigator.
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
