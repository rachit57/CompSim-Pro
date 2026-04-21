import { create } from 'zustand';

interface GameState {
  sessionCode: string | null;
  role: 'student' | 'admin' | null;
  playerName: string | null;
  sessionData: any | null;
  setSession: (sessionCode: string, role: 'student' | 'admin', playerName: string) => void;
  updateSessionData: (data: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
  sessionCode: null,
  role: null,
  playerName: null,
  sessionData: null,
  setSession: (sessionCode, role, playerName) => set({ sessionCode, role, playerName }),
  updateSessionData: (data) => set({ sessionData: data }),
}));
