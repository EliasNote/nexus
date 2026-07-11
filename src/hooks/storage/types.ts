import type { EncryptedVault } from "@/types/vault";

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
  isLoading: boolean;
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
  isLoading: boolean;
  exists(): Promise<VaultMetadata | null>;
  download(): Promise<EncryptedVault>;
  upload(vault: EncryptedVault): Promise<VaultMetadata>;
  delete(): Promise<void>;
}
