// Importa o LinearGradient do Expo para criar barras de progresso coloridas
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { useHistory } from "../context/HistoryContext"; // Contexto que guarda o histórico de ações do usuário

// Obtém a largura da tela do dispositivo, usada para definir a largura das cards
const SCREEN_WIDTH = Dimensions.get("window").width;

// Define o tipo de uma missão (quest) básica
type Quest = {
  id: string; // ID única da missão
  title: string; // Título da missão
  description: string; // Descrição do que o usuário precisa fazer
  target: number; // Quantidade necessária para completar a missão
  reward: number; // XP que o usuário ganha ao completar
  icon: string; // Emoji ou ícone representativo da missão
  type: "daily" | "weekly" | "monthly"; // Tipo de missão (diária, semanal ou mensal)
  unit: "mL" | "missions"; // Unidade de medição (quantidade de água ou número de missões)
};

// Extensão da Quest incluindo o progresso atual do usuário
type QuestWithProgress = Quest & { progress: number };

export default function RPGQuestsScreen() {
  // Pega o histórico de ações do usuário do contexto
  const { history } = useHistory();

  // Lista fixa de missões disponíveis
  const quests: Quest[] = [
    { id: "d1", title: "Poção da Manhã", description: "Beber 800 mL", target: 800, reward: 10, icon: "🧪", type: "daily", unit: "mL" },
    { id: "d2", title: "Escudo da Tarde", description: "Beber 800 mL", target: 800, reward: 15, icon: "🛡️", type: "daily", unit: "mL" },
    { id: "d3", title: "Elixir da Energia", description: "Beber 800 mL", target: 800, reward: 20, icon: "⚡", type: "daily", unit: "mL" },
    { id: "w1", title: "Semana Hídrica", description: "Beber 8L de água na semana", target: 8000, reward: 50, icon: "📅", type: "weekly", unit: "mL" },
    { id: "m1", title: "Maratona da Hidratação", description: "Beber 32L de água no mês", target: 32000, reward: 200, icon: "🌊", type: "monthly", unit: "mL" },
  ];

  // Calcula o progresso do usuário em cada missão com base no histórico
  const questsProgress: QuestWithProgress[] = useMemo(() => {
    let consumedDaily = 0; // Controla a quantidade diária já contabilizada
    const totalDrank = history
      .filter(h => h.action === "Bebeu") // Filtra apenas ações de beber água
      .reduce((sum, h) => sum + h.amount, 0); // Soma total consumido

    return quests.map(q => {
      let progress = 0;

      // Calcula progresso baseado na unidade da missão
      if (q.unit === "mL") {
        if (q.type === "daily") {
          // Para diárias, contabiliza a quantidade que ainda falta
          progress = Math.min(Math.max(totalDrank - consumedDaily, 0), q.target);
          consumedDaily += progress;
        } else {
          // Para missões semanais/mensais, considera o total consumido
          progress = Math.min(totalDrank, q.target);
        }
      } else if (q.unit === "missions") {
        // Para missões baseadas em quantidade de missões
        if (q.type === "weekly") {
          const daysWithAllDailies = Math.floor(totalDrank / 600); // Assume que 600 mL/dia completa diária
          progress = Math.min(daysWithAllDailies, q.target);
        } else if (q.type === "monthly") {
          const weeksWithAllDailies = Math.floor(totalDrank / (600 * 7)); // Semanas completas
          progress = Math.min(weeksWithAllDailies, q.target);
        }
      }

      return { ...q, progress }; // Retorna a missão com o progresso atualizado
    });
  }, [history]);

  // Função que renderiza cada card de missão
  const renderQuest = (item: QuestWithProgress) => {
    const completed = item.progress >= item.target; // Verifica se missão foi concluída
    const progressPercent = Math.round((item.progress / item.target) * 100); // Porcentagem para a barra de progresso

    // Gradientes de cores por tipo de missão
    const typeGradients = {
      daily: ["#3B82F6", "#60A5FA"] as const,
      weekly: ["#FBBF24", "#FCD34D"] as const,
      monthly: ["#EF4444", "#F87171"] as const,
    };
    const completedGradient = ["#4ADE80", "#22C55E"] as const; // Cor verde para missões concluídas

    return (
      <View style={[styles.card, { borderLeftColor: completed ? "#4ADE80" : typeGradients[item.type][0] }]} key={item.id}>
        {/* Cabeçalho do card com ícone e título */}
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.questTitle}>{item.title}</Text>
        </View>

        {/* Descrição da missão */}
        <Text style={styles.questDescription}>{item.description}</Text>

        {/* Recompensa da missão */}
        <Text style={[styles.xpText, { color: completed ? "#4ADE80" : typeGradients[item.type][0] }]}>
          Recompensa: +{item.reward} XP 🏆
        </Text>

        {/* Barra de progresso */}
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={completed ? completedGradient : typeGradients[item.type]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>

        {/* Texto com progresso */}
        <Text style={styles.progressText}>
          {item.progress}/{item.target} {item.unit === "missions" ? "missões" : "mL"}
        </Text>

        {/* Texto de missão concluída */}
        {completed && <Text style={styles.completedText}>Missão Concluída! ✅</Text>}
      </View>
    );
  };

  // Função que renderiza seções de missões (diárias, semanais, mensais)
  const renderSection = (title: string, data: QuestWithProgress[]) => {
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={data} // Dados da seção
          horizontal // Scroll horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled // Scroll com "página" por card
          snapToInterval={SCREEN_WIDTH} // Snap de acordo com largura da tela
          decelerationRate="fast"
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderQuest(item)}
        />
      </>
    );
  };

  // Renderiza a tela principal
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missões</Text>
      {renderSection("Diárias", questsProgress.filter(q => q.type === "daily"))}
      {renderSection("Semanais", questsProgress.filter(q => q.type === "weekly"))}
      {renderSection("Mensais", questsProgress.filter(q => q.type === "monthly"))}
    </View>
  );
}

// Estilos da tela e dos cards
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 20, backgroundColor: "#F5F9FF" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1E3A8A", textAlign: "center", marginBottom: 20 },

  sectionTitle: { fontSize: 22, fontWeight: "600", color: "#1E40AF", marginVertical: 10, marginLeft: 10 },

  card: {
    width: SCREEN_WIDTH,
    marginRight: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { fontSize: 32, marginRight: 12 },
  questTitle: { fontSize: 20, fontWeight: "700", color: "#1E40AF" },
  questDescription: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  xpText: { fontSize: 14, fontWeight: "700", marginBottom: 6 },

  progressBarBackground: { height: 14, backgroundColor: "#E0E7FF", borderRadius: 10, overflow: "hidden", marginTop: 6 },
  progressBarFill: { height: 14, borderRadius: 10 },

  progressText: { fontSize: 13, color: "#374151", marginTop: 4, marginBottom: 8, textAlign: "right" },
  completedText: { color: "#16A34A", fontWeight: "bold", textAlign: "center", marginTop: 6 },
});
