export interface StorageProviderInterface {
  token: string | null;
  refresh: () => Promise<string | null>;
  isLoading: boolean;
  find: () => Promise<string | null>;
  login: () => void;
  loginWithPromise: () => Promise<string | null>;
  download: () => Promise<any>;
  uploadVault: (content: string) => Promise<any>;
  disconnect: () => void;
}
