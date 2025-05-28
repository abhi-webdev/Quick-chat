import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("quickchat-theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("quickchat-theme", theme);
    set({ theme });
  },
}));