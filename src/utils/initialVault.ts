import type { DecryptedVault } from "@/types/vault";

export const version = "1.0";

export const createInitialVault = async (): Promise<DecryptedVault> => {
  return {
    version: version,
    folders: [],
    entries: [],
  };
};
