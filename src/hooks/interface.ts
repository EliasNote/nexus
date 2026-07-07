import type { EncryptedVault } from "@/types/vault";

export type CloudFileMetadata = {
  id?: string;
  sha?: string;
};

export type CloudUploadResult = CloudFileMetadata & {
  name?: string;
  mimeType?: string;
};

export interface StorageProviderInterface {
  token: string | null;
  refresh: () => Promise<string | null>;
  isLoading: boolean;
  find: () => Promise<CloudFileMetadata | null>;
  loginRepoNotFound?: () => void;
  needsRepoFix?: boolean;
  setNeedsRepoFix?: (needsRepoFix: boolean) => void;
  login: () => void;
  loginWithPromise: () => Promise<string | null>;
  download: () => Promise<EncryptedVault>;
  uploadVault: (vault: EncryptedVault) => Promise<CloudUploadResult>;
  disconnect: () => void;
  deleteVault: () => Promise<void>;
}
