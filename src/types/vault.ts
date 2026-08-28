export const CREDENTIAL_TYPES = {
  LOGIN: "login",
  CARD: "card",
  NOTE: "note",
} as const;

export const CREDENTIAL_TYPES_LABELS = {
  [CREDENTIAL_TYPES.LOGIN]: "LOGIN",
  [CREDENTIAL_TYPES.CARD]: "CARTÃO",
  [CREDENTIAL_TYPES.NOTE]: "NOTA",
};

export type CredentialType =
  (typeof CREDENTIAL_TYPES)[keyof typeof CREDENTIAL_TYPES];

export interface Directory {
  id: string;
  name: string;
  icon?: string;
  colorHex?: string;
}

export interface AuditInfo {
  isCompromised?: boolean;
  isWeak?: boolean;
  reusedsIds?: string[];
  isRenewal?: boolean;
}

export interface CredentialSummary {
  id: string;
  type: CredentialType;
  title: string;
  username?: string | null | undefined;
  holderName?: string | null | undefined;
  name?: string | null | undefined;
  auditInfo?: AuditInfo | null;
  directoriesIds?: string[];
  isFavorite: boolean;
  isDeleted: boolean;
}

export interface VaultSummarizedData {
  autoSaveInterval: number;
  directories: Directory[];
  credentials: CredentialSummary[];
}

export interface CommonMetadata {
  id: string;
  title: string;
  notes?: string;
  directoriesIds?: string[];
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: string;
  lastPasswordChange?: string;
  updatedAt: string;
}

export interface LoginCredential extends CommonMetadata {
  type: typeof CREDENTIAL_TYPES.LOGIN;
  username?: string;
  password?: string;
  url?: string;
}

export interface CreditCardCredential extends CommonMetadata {
  type: typeof CREDENTIAL_TYPES.CARD;
  holderName: string;
  cardNumber: string;
  password?: string;
  expirationDate: string;
  cvv: string;
}

export interface NoteCredential extends CommonMetadata {
  type: typeof CREDENTIAL_TYPES.NOTE;
  name: string;
  password?: string;
  content: string;
}

export type Credential =
  | LoginCredential
  | CreditCardCredential
  | NoteCredential;

export interface EncryptedData {
  iv: string;
  tag: string;
  ciphertext: string;
}

export interface KdfConfig {
  salt: string;
  memory: number;
  iterations: number;
  parallelism: number;
}

export interface Vault {
  version: string;
  autoSaveInterval: number;
  kdf: KdfConfig;
  encrypted_dek: EncryptedData;
  directories: EncryptedData;
  credentials: {
    [uuid: string]: EncryptedData;
  };
}

export interface EncryptedVault {
  version: string;
  kdf: KdfConfig;
  encrypted_vault: EncryptedData;
}
