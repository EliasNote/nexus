import { useThemeStore, type ThemePreference } from "@/config/themeStore";

export function ThemeSelect() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  return (
    <label className="flex flex-wrap items-center gap-3 text-sm text-primary">
      <span>Aparência</span>
      <select
        aria-label="Tema da interface"
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        className="theme-select cursor-pointer border border-line-strong bg-surface px-3 py-2 text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <option value="dark">Escuro</option>
        <option value="light">Claro</option>
        <option value="system">Sistema</option>
      </select>
    </label>
  );
}
