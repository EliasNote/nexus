import { useCloudStore } from "@/hooks/useCloudStore";
import type { EntrySummary, VaultSummarizedData } from "@/types/vault";

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
  } catch (e) {
    return false;
  }
};

export const updateSummaryVaultCredential = (
  vault: VaultSummarizedData,
  updatedCredential: EntrySummary,
): VaultSummarizedData => {
  const setSummaryVault = useCloudStore.getState().setSummaryVault;

  const exists = vault.entries.some(
    (entry) => entry.id === updatedCredential.id,
  );

  let newEntries;

  if (exists) {
    newEntries = vault.entries.map((entry) =>
      entry.id === updatedCredential.id ? { ...updatedCredential } : entry,
    );
  } else {
    newEntries = [updatedCredential, ...vault.entries];
  }

  const result = {
    ...vault,
    entries: newEntries,
  };

  setSummaryVault(result);
  return result;
};
