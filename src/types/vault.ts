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

export type Directory = {
  id: string;
  name: string;
  icon?: string;
  colorHex?: string;
};

export type AuditInfo = {
  isCompromised?: boolean;
  isWeak?: boolean;
  isReused?: boolean;
  isRenewal?: boolean;
};

export interface CredentialSummary {
  id: string;
  type: CredentialType;
  title: string;
  username?: string | null | undefined;
  holderName?: string | null | undefined;
  name?: string | null | undefined;
  auditInfo?: AuditInfo;
  reusedIds?: string[];
  directoriesIds?: string[];
  isFavorite: boolean;
  isDeleted: boolean;
}

export interface VaultSummarizedData {
  autoSaveInterval: number;
  directories: Directory[];
  credentials: CredentialSummary[];
}

export type CommonMetadata = {
  id: string;
  title: string;
  notes?: string;
  directoriesIds?: string[];
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: string;
  lastPasswordChange?: string;
  updatedAt: string;
};

export type LoginCredential = CommonMetadata & {
  type: typeof CREDENTIAL_TYPES.LOGIN;
  username?: string;
  password?: string;
  url?: string;
};

export type CreditCardCredential = CommonMetadata & {
  type: typeof CREDENTIAL_TYPES.CARD;
  holderName: string;
  cardNumber: string;
  password?: string;
  expirationDate: string;
  cvv: string;
};

export type NoteCredential = CommonMetadata & {
  type: typeof CREDENTIAL_TYPES.NOTE;
  name: string;
  password?: string;
  content: string;
};

export type Credential =
  LoginCredential | CreditCardCredential | NoteCredential;

export type EncryptedData = {
  iv: string;
  tag: string;
  ciphertext: string;
};

export type KdfConfig = {
  salt: string;
  memory: number;
  iterations: number;
  parallelism: number;
};

export type Vault = {
  version: string;
  autoSaveInterval: number;
  kdf: KdfConfig;
  encrypted_dek: EncryptedData;
  directories: EncryptedData;
  credentials: {
    [uuid: string]: EncryptedData;
  };
};

export type EncryptedVault = {
  version: string;
  kdf: KdfConfig;
  encrypted_vault: EncryptedData;
};
