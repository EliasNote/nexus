export const CREDENTIAL_TYPES = {
  LOGIN: "login",
  CARD: "card",
  NOTE: "note",
} as const;

export type CredentialType =
  (typeof CREDENTIAL_TYPES)[keyof typeof CREDENTIAL_TYPES];

export type Folder = {
  id: string;
  name: string;
  icon?: string;
  colorHex?: string;
};

export type AuditData = {
  isCompromised?: boolean;
  isWeak?: boolean;
  isReused?: boolean;
  isRenewal?: boolean;
};

export interface EntrySummary {
  id: string;
  type: "login" | "card" | "note";
  title: string;
  username?: string | null | undefined;
  holderName?: string | null | undefined;
  name?: string | null | undefined;
  auditData?: AuditData;
  foldersIds?: string[];
  isFavorite: boolean;
  isDeleted: boolean;
}

export interface VaultSummarizedData {
  folders: Folder[];
  entries: EntrySummary[];
}

export type CommonMetadata = {
  id: string;
  title: string;
  notes?: string;
  foldersIds?: string[];
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
  | LoginCredential
  | CreditCardCredential
  | NoteCredential;

export type DecryptedVault = {
  version: string;
  folders: Folder[];
  entries: Credential[];
};

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

export type EncryptedVault = {
  version: string;
  autoSaveInterval?: number;
  kdf: KdfConfig;
  encrypted_dek: EncryptedData;
  folders: EncryptedData;
  entries: {
    [uuid: string]: EncryptedData;
  };
};
