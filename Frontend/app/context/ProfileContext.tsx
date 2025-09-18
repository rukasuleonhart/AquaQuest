import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateDailyWaterTarget, calculatePerMissionTarget } from "../utils/waterUtils";
import api from "../services/api";

export type Profile = {
  id: number;
  name: string;
  activityTime: number;
  weightKg: number;
  ambientTempC: number;
  level: number;
  currentXP: number;
  xpToNext: number;
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  dailyWaterTargetMl: number;
  waterPerMissionMl: number;
};

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  dailyWaterTargetMl: 0,
  waterPerMissionMl: 0,
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/perfil");
        const data: Profile = {
          id: res.data.id,
          name: res.data.name,
          activityTime: res.data.activity_time,
          weightKg: res.data.weight_kg,
          ambientTempC: res.data.ambient_temp_c,
          level: res.data.level,
          currentXP: res.data.current_xp,
          xpToNext: res.data.xp_to_next,
        };
        setProfile(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Cálculos arredondados
  const dailyWaterTargetMl = profile ? Math.round(calculateDailyWaterTarget(profile.weightKg)) : 0;
  const waterPerMissionMl = profile ? Math.round(calculatePerMissionTarget(profile.weightKg, 3)) : 0;

  return (
    <ProfileContext.Provider value={{ profile, loading, dailyWaterTargetMl, waterPerMissionMl }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
