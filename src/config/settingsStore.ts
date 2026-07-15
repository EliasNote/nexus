import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore('settings.json');

export async function saveSettings(
  vaultPath: string,
): Promise<void> {
  console.log("saving settings", vaultPath)
  await store.set("vaultPath", vaultPath);
  await store.save();
}

export async function loadSettings(): Promise<string | null> {
  const vaultPath = await store.get<string>("vaultPath");
  console.log("loaded settings", vaultPath)
  return vaultPath ?? null;
}
