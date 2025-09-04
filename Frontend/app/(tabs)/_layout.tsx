import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; //Icon Relogio
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'; //Icon Copo de Agua
import Ionicons from '@expo/vector-icons/Ionicons'; //person
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; //sword

import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "rgba(2, 136, 209, 0.95))", tabBarInactiveTintColor:"#c3cfe2"}}>
      
      <Tabs.Screen name="index" options={{ title: "Beber", tabBarIcon: ({color}) => <FontAwesome6 name="glass-water" size={24} color={color} />}}/>
      <Tabs.Screen name="history" options={{ title: "Historico", tabBarIcon: ({color}) => <FontAwesome5 name="clock" size={24} color={color} />}}/>
      <Tabs.Screen name="quest" options={{ title: "Quests", tabBarIcon: ({color}) => <MaterialCommunityIcons name="sword" size={24} color={color} />}}/>
      <Tabs.Screen name="i" options={{ title: "Eu", tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color}/>}}/>
    </Tabs>
  ) 
}