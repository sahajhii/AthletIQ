import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

interface UiState {
  mobileMenuOpen: boolean;
  theme: ThemeMode;
  setMobileMenuOpen: (value: boolean) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      theme: "dark",
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "athletiq-ui",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
