import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";
const storageKey = "nexus-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "system") return saved;
  } catch { /* Appearance remains available when storage is restricted. */ }
  return "dark";
}

function applyTheme(preference: ThemePreference) {
  const resolved = preference === "system" ? (systemTheme.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

const preference = readPreference();
export const useThemeStore = create<{
  preference: ThemePreference;
  resolved: "light" | "dark";
  setPreference: (preference: ThemePreference) => void;
}>((set) => ({
  preference,
  resolved: applyTheme(preference),
  setPreference: (preference) => {
    try { localStorage.setItem(storageKey, preference); } catch { /* Keep the in-memory choice. */ }
    set({ preference, resolved: applyTheme(preference) });
  },
}));

systemTheme.addEventListener("change", () => {
  if (useThemeStore.getState().preference === "system") {
    useThemeStore.setState({ resolved: applyTheme("system") });
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === storageKey || event.key === null) {
    const preference = readPreference();
    useThemeStore.setState({ preference, resolved: applyTheme(preference) });
  }
});
