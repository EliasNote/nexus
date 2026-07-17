import { LazyStore } from "@tauri-apps/plugin-store";

const store = new LazyStore("settings.json");

export type SavedSettings = {
  vaultPath: string;
  provider: "local" | "git";
};

export async function saveSettings(
  vaultPath: string,
  provider: SavedSettings["provider"],
): Promise<void> {
  await store.set("vaultPath", vaultPath);
  await store.set("provider", provider);
  await store.save();
}

export async function loadSettings(): Promise<SavedSettings | null> {
  const vaultPath = await store.get<string>("vaultPath");
  const provider = await store.get<SavedSettings["provider"]>("provider");

  if (!vaultPath) return null;

  return {
    vaultPath,
    provider: provider ?? "local",
  };
}
