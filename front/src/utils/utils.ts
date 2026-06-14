import type { DecryptedVault, VaultEntry } from "@/types/vault";

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

export const updateVaultCredential = (
  vault: DecryptedVault,
  updatedCredential: VaultEntry,
): DecryptedVault => {
  return {
    ...vault,
    entries: vault.entries.map((entry) =>
      entry.id === updatedCredential.id ? { ...updatedCredential } : entry,
    ),
  };
};
