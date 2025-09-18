import React, { createContext, useContext, useEffect, useState } from "react";

// ---------------------------
// Tipos
// ---------------------------
export type Profile = {
  name: string;      // Nome do usuário
  weightKg: number;  // Peso em kg do usuário
};

// Tipagem do contexto, descreve os dados e funções que o contexto fornece
type ProfileContextType = {
  profile: Profile | null;      // Perfil do usuário (pode ser null se ainda não carregou)
  loading: boolean;             // Indica se o perfil ainda está carregando
  setProfile: (p: Profile) => void; // Função para atualizar o perfil
};

// ---------------------------
// Contexto
// ---------------------------
const ProfileContext = createContext<ProfileContextType>({
  profile: null,              // Inicialmente não há perfil
  loading: true,              // Inicialmente está carregando
  setProfile: (_: Profile) => {}, // Função vazia para tipagem segura
});

// ---------------------------
// Provider
// ---------------------------
export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null); // Estado do perfil
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // ---------------------------
  // useEffect roda uma vez ao montar o componente
  // ---------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Simulação de carregamento de perfil (poderia ser AsyncStorage ou API)
        const saved: Profile = await Promise.resolve({ name: "Lucas", weightKg: 50 });
        setProfile(saved); // Atualiza o estado com o perfil carregado
      } catch (err) {
        console.error("Erro ao carregar perfil:", err); // Trata erros
      } finally {
        setLoading(false); // Marca como carregado, mesmo se houver erro
      }
    };

    loadProfile(); // Executa a função de carregamento
  }, []); // Array vazio significa que roda apenas uma vez

  // Apenas para debug no console
  console.log("ProfileContext atual:", profile);

  // ---------------------------
  // Provider fornece os dados e funções para os componentes filhos
  // ---------------------------
  return (
    <ProfileContext.Provider value={{ profile, loading, setProfile }}>
      {children} {/* Renderiza todos os componentes filhos */}
    </ProfileContext.Provider>
  );
};

// ---------------------------
// Hook de acesso
// ---------------------------
export const useProfile = () => {
  const context = useContext(ProfileContext); // Acessa o contexto
  if (!context) {
    // Garante que o hook seja usado dentro de um Provider
    throw new Error("useProfile deve ser usado dentro de um ProfileProvider");
  }
  return context; // Retorna perfil, loading e função setProfile
};
