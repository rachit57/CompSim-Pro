import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  sessionCode: string | null;
  role: 'student' | 'admin' | null;
  playerName: string | null;
  sessionData: any | null;
  hydrated: boolean;
  setSession: (sessionCode: string, role: 'student' | 'admin', playerName: string) => void;
  updateSessionData: (data: any) => void;
  setHydrated: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      sessionCode: null,
      role: null,
      playerName: null,
      sessionData: null,
      hydrated: false,
      setSession: (sessionCode, role, playerName) => set({ sessionCode, role, playerName }),
      updateSessionData: (data) => set({ sessionData: data }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'comp-sim-pro-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
