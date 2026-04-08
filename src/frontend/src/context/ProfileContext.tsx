import { type ReactNode, createContext, useContext, useState } from "react";
import type { UserProfile } from "../types/domain";

interface ProfileContextValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  isDemoMode: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // isDemoMode is only true when explicitly set — null/undefined defaults to false.
  // This prevents new users (whose demoMode hasn't been set yet) from being stuck in demo mode.
  const isDemoMode = profile !== null && profile?.demoMode === true;

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isDemoMode }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
