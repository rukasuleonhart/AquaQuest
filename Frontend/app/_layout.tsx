import { Stack } from "expo-router";

/**
 * RootLayout é o componente raiz da navegação do app.
 * Ele define como as telas serão organizadas usando o Stack Navigator.
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
