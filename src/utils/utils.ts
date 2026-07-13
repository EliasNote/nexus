import { useCloudStore } from "@/hooks/useCloudStore";
import type { Credential, EntrySummary, VaultSummarizedData } from "@/types/vault";
import { isTauri } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export const getGithubUserData = async (token: string) => {
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await userRes.json();
};

export const getGithubUserRepo = async (token: string, user: string) => {
  const repoRes = await fetch(
    `https://api.github.com/repos/${user}/nexus-vault`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return repoRes;
};

export async function copyToClipboard(text: string): Promise<void> {
    if (isTauri()) {
      await writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return;
  }

export const updateSummaryVaultCredential = (
  vault: VaultSummarizedData,
  updatedCredential: Credential,
): VaultSummarizedData => {
  const setSummaryVault = useCloudStore.getState().setSummaryVault;

  const currentEntry = vault.entries.find(
    (entry) => entry.id === updatedCredential.id,
  );
  const summaryEntry: EntrySummary = {
    id: updatedCredential.id,
    type: updatedCredential.type,
    title: updatedCredential.title,
    username:
      updatedCredential.type === "login" ? updatedCredential.username : null,
    holderName:
      updatedCredential.type === "card" ? updatedCredential.holderName : null,
    name: updatedCredential.type === "note" ? updatedCredential.name : null,
    auditData: currentEntry?.auditData,
    reusedIds: currentEntry?.reusedIds,
    foldersIds: updatedCredential.foldersIds,
    isFavorite: updatedCredential.isFavorite,
    isDeleted: updatedCredential.isDeleted,
  };

  const newEntries = currentEntry
    ? vault.entries.map((entry) =>
        entry.id === updatedCredential.id ? summaryEntry : entry,
      )
    : [summaryEntry, ...vault.entries];

  const result = {
    ...vault,
    entries: newEntries,
  };

  setSummaryVault(result);
  return result;
};

export function formatGitHubRemoteUrl(value: string): string {
  const input = value.trim();
  const match = input.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)(?:\/tree\/[^/?#]+)?\/?$/i);

  if (!match) {
    throw new Error("Informe um link valido de um repositorio do GitHub.");
  }

  const [, owner, repository] = match;
  const cleanRepository = repository.replace(/\.git$/i, "");

  return `https://github.com/${owner}/${cleanRepository}.git`;
}
