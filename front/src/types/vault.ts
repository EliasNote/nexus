export type Folder = {
  id: string;
  name: string;
  icon?: string;
  colorHex?: string;
};

export interface EntrySummary {
  id: string;
  type: "login" | "card" | "note";
  title: string;
  username?: string | null | undefined;
  holderName?: string | null | undefined;
  name?: string | null | undefined;
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
  audit: Audit;
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginCredential = CommonMetadata & {
  type: "login";
  username?: string;
  password?: string;
  url?: string;
};

export type CreditCardCredential = CommonMetadata & {
  type: "card";
  holderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
};

export type NoteCredential = CommonMetadata & {
  type: "note";
  name: string;
  content: string;
};

export type Credential =
  | LoginCredential
  | CreditCardCredential
  | NoteCredential;

export type Audit = {
  leak: boolean;
  weak: boolean;
  reused: boolean;
  renewal: boolean;
};

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
  kdf: KdfConfig;
  encrypted_dek: EncryptedData;
  folders: EncryptedData;
  entries: {
    [uuid: string]: EncryptedData;
  };
};
