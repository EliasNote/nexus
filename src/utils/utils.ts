import { useCloudStore } from "@/hooks/useCloudStore";
import type { Credential, EntrySummary, VaultSummarizedData } from "@/types/vault";

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

export const copyToClipboard = (text: string) => {
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

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

