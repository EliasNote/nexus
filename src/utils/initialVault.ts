import type { Vault, KdfConfig, EncryptedData } from "@/types/vault";

export const version = "1.0";

export const getBaseVault = async (kdf: KdfConfig, encrypted_dek: EncryptedData, directories: EncryptedData): Promise<Vault> => {
  return {
    version: version,
    autoSaveInterval: 60000,
    kdf: kdf,
    encrypted_dek: encrypted_dek,
    directories: directories,
    credentials: {},
  };
};
