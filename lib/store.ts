import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppState, ScanResult, UserProfile, IntakeEstimate, Theme } from "./types";

const MAX_HISTORY = 20;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      history: [],
      currentScan: null,
      theme: "system" as Theme,
      todayIntake: null,

      setProfile: (profile: UserProfile) => set({ profile }),

      updateProfile: (updates: Partial<UserProfile>) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      setCurrentScan: (scan: ScanResult) => set({ currentScan: scan }),

      addToHistory: (scan: ScanResult) =>
        set((state) => ({
          history: [scan, ...state.history].slice(0, MAX_HISTORY),
        })),

      loadScanFromHistory: (id: string) => {
        const scan = get().history.find((s) => s.id === id);
        if (scan) {
          set({ currentScan: scan });
        }
      },

      setTheme: (theme: Theme) => set({ theme }),

      setTodayIntake: (intake: IntakeEstimate | null) =>
        set({ todayIntake: intake }),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "eatwise-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // SSR fallback
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        profile: state.profile,
        history: state.history,
        theme: state.theme,
        todayIntake: state.todayIntake,
      }),
    }
  )
);
