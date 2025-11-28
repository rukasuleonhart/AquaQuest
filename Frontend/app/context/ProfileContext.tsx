import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
  calculateDailyWaterTarget,
  calculateExtraExerciseMission,
  calculatePerMissionTarget,
} from "../utils/waterUtils";

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
  extraMissionMl: number;
  refreshProfile: () => Promise<void>;
  updateProfileField: (field: keyof Profile, value: any) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  dailyWaterTargetMl: 0,
  waterPerMissionMl: 0,
  extraMissionMl: 0,
  refreshProfile: async () => {},
  updateProfileField: async () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
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
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchProfile();
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateProfileField = async (field: keyof Profile, value: any) => {
    const backendMap: Record<keyof Profile, string> = {
      id: "id",
      name: "name",
      activityTime: "activity_time",
      weightKg: "weight_kg",
      ambientTempC: "ambient_temp_c",
      level: "level",
      currentXP: "current_xp",
      xpToNext: "xp_to_next",
    };

    const payload: any = {};
    payload[backendMap[field]] = value;

    await api.patch("/perfil/", payload);
    await refreshProfile();
  };

  const dailyWaterTargetMl = profile
    ? Math.round(calculateDailyWaterTarget(profile.weightKg))
    : 0;

  const waterPerMissionMl = profile
    ? Math.round(calculatePerMissionTarget(profile.weightKg, 3))
    : 0;

  const extraMissionMl = profile
    ? Math.round(
        calculateExtraExerciseMission(profile.activityTime, profile.ambientTempC)
      )
    : 0;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        dailyWaterTargetMl,
        waterPerMissionMl,
        extraMissionMl,
        refreshProfile,
        updateProfileField,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
