import type { StorageProvider } from '@/hooks/storage/types';
import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore('settings.json');

export async function saveSettings(
  vaultPath: string,
  activeProvider: StorageProvider,
): Promise<void> {
  await store.set("vaultPath", vaultPath);
  await store.set("activeProvider", activeProvider);
  await store.save();
}

export async function loadSettings(): Promise<{
  vaultPath: string | null;
  activeProvider: StorageProvider;
}> {
  const vaultPath = await store.get<string>("vaultPath");
  const activeProvider = await store.get<StorageProvider>("activeProvider");

  return {
    vaultPath: vaultPath ?? null,
    activeProvider: activeProvider ?? null,
  };
}
