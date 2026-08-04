import type {
  EncryptedVault,
  EncryptedVaultEnvelope,
  VaultSummarizedData,
} from "@/types/vault";

export type StorageProvider =
  | "google"
  | "local"
  | "git"
  | null;

export interface AuthSession {
  isAuthenticated: boolean;
  connect(): Promise<string | null>;
  refresh(): Promise<string | null>;
  disconnect(): void;
}

export interface GitRepository {
  directory: string | null;
  remoteUrl?: string;
  isGitRepo(): Promise<boolean>;
  initialize(remoteUrl: string): Promise<void>;
  sync(): Promise<void>;
}

export type VaultMetadata = {
  id?: string;
  revision?: string;
  name?: string;
  mimeType?: string;
};

export interface VaultStorage {
  exists(): Promise<string | null>;
  isRepo?(): Promise<boolean>;
  isLoading?: boolean;
  initialize?(remoteUrl: string): Promise<void>;
  download(): Promise<EncryptedVaultEnvelope>;
  upload(vault: EncryptedVaultEnvelope): Promise<void>;
  delete(): Promise<void>;
}

export type CloudState = {
  activeProvider: StorageProvider;
  setActiveProvider: (
    provider: StorageProvider,
  ) => void;

  vault: EncryptedVault | null;
  setVault: (vault: EncryptedVault | null) => void;

  vaultPath: string | null;
  setVaultPath: (vaultPath: string | null) => void;

  summaryVault: VaultSummarizedData | null;
  setSummaryVault: (
    vault: VaultSummarizedData | null,
  ) => void;

  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

  expiresIn: number | null;
  setExpiresIn: (expiresIn: number | null) => void;

  isTokenValid: boolean;
  setIsTokenValid: (value: boolean) => void;

  isPendingSync: boolean;
  setIsPendingSync: (value: boolean) => void;

  isSaving: boolean;
  setIsSaving: (value: boolean) => void;

  autoSaveInterval: number;
  setAutoSaveInterval: (value: number) => void;

  clearSession: () => void;
};
