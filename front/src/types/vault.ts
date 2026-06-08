export type Folder = {
  id: string;
  name: string;
  icon?: string;
  colorHex?: string;
};

export type CommonMetadata = {
  id: string;
  title: string;
  notes?: string;
  foldersIds?: string[];
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export type VaultEntry =
  | LoginCredential
  | CreditCardCredential
  | NoteCredential;

export type DecryptedVault = {
  version: string;
  folders: Folder[];
  entries: VaultEntry[];
};
