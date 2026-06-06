export interface StorageProviderInterface {
  token: string | null;
  refresh: () => Promise<string | null>;
  isLoading: boolean;
  find: () => Promise<string | null>;
  loginRepoNotFound?: () => void;
  needsRepoFix?: boolean;
  setNeedsRepoFix?: (needsRepoFix: boolean) => void;
  login: () => void;
  loginWithPromise: () => Promise<string | null>;
  download: () => Promise<any>;
  uploadVault: (content: string) => Promise<any>;
  disconnect: () => void;
}
