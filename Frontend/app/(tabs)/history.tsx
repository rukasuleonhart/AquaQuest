import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

interface Registro {
  id: string;
  quantidade: number;
  hora: string;
}

interface HistoryScreenProps {
  registros: Registro[];
}

export default function HistoryScreen({ registros }: HistoryScreenProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.texto}>{item.quantidade} mL</Text>
            <Text style={styles.hora}>{item.hora}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F0FF", paddingHorizontal: 20 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  texto: { fontSize: 16, color: "#333" },
  hora: { fontSize: 16, color: "#555" },
});
