import type { DecryptedVault } from "@/types/vault";
import { cryptoService } from "@/hooks/useCloudStore";
import { argon2id } from "hash-wasm";

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const encryptWithKey = async (key: CryptoKey, plaintext: Uint8Array) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );
  const encryptedBytes = new Uint8Array(encrypted);
  return {
    iv: uint8ArrayToBase64(iv),
    tag: uint8ArrayToBase64(encryptedBytes.slice(encryptedBytes.length - 16)),
    ciphertext: uint8ArrayToBase64(
      encryptedBytes.slice(0, encryptedBytes.length - 16),
    ),
  };
};

const decryptWithKey = async (
  key: CryptoKey,
  encrypted: any,
): Promise<Uint8Array> => {
  const iv = base64ToUint8Array(encrypted.iv);
  const ciphertext = base64ToUint8Array(encrypted.ciphertext);
  const tag = base64ToUint8Array(encrypted.tag);

  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    combined,
  );
  return new Uint8Array(decrypted);
};

export const derivateKek = async (
  password: string,
  saltBase64: string,
): Promise<string> => {
  const saltBytes = base64ToUint8Array(saltBase64);
  const hashHex = await argon2id({
    password,
    salt: saltBytes,
    iterations: 3,
    memorySize: 65536,
    parallelism: 1,
    hashLength: 32,
    outputType: "binary",
  });

  const rawKeyBytes = new Uint8Array(hashHex);
  const kekBase64 = uint8ArrayToBase64(rawKeyBytes);
  rawKeyBytes.fill(0);
  return kekBase64;
};

export const generateDek = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return uint8ArrayToBase64(bytes);
};

export const encryptDek = async (
  dekBase64: string,
  kekBase64: string,
): Promise<string> => {
  const rawDek = base64ToUint8Array(dekBase64);
  const rawKek = base64ToUint8Array(kekBase64);

  const KEK = await crypto.subtle.importKey(
    "raw",
    rawKek,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  rawKek.fill(0);

  const encryptedData = await encryptWithKey(KEK, rawDek);
  rawDek.fill(0);

  return JSON.stringify(encryptedData);
};

export const decryptDek = async (
  encryptedDekJson: string,
  kekBase64: string,
): Promise<string> => {
  const encrypted = JSON.parse(encryptedDekJson);
  const rawKek = base64ToUint8Array(kekBase64);

  const KEK = await crypto.subtle.importKey(
    "raw",
    rawKek,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  rawKek.fill(0);

  const rawDekBytes = await decryptWithKey(KEK, encrypted);
  const dekBase64 = uint8ArrayToBase64(rawDekBytes);
  rawDekBytes.fill(0);

  return dekBase64;
};

export const encryptVault = async (
  vaultEntries: any[],
  folders: any[] = [],
): Promise<any> => {
  const foldersString = JSON.stringify(folders);
  const encryptedFolders = await cryptoService.encrypt(foldersString);
  const encryptedFoldersData = {
    iv: uint8ArrayToBase64(encryptedFolders.iv),
    tag: uint8ArrayToBase64(encryptedFolders.tag),
    ciphertext: uint8ArrayToBase64(encryptedFolders.ciphertext),
  };

  const entries: { [uuid: string]: any } = {};
  for (const entry of vaultEntries) {
    const entryString = JSON.stringify(entry);
    const result = await cryptoService.encrypt(entryString);
    entries[entry.id] = {
      iv: uint8ArrayToBase64(result.iv),
      tag: uint8ArrayToBase64(result.tag),
      ciphertext: uint8ArrayToBase64(result.ciphertext),
    };
  }

  return { folders: encryptedFoldersData, entries };
};

export const decryptVault = async (vault: any): Promise<any> => {
  const decryptedFoldersString = await cryptoService.decrypt(
    base64ToUint8Array(vault.folders.ciphertext),
    base64ToUint8Array(vault.folders.iv),
    base64ToUint8Array(vault.folders.tag),
  );
  const folders = JSON.parse(decryptedFoldersString);

  const entries: any[] = [];
  for (const uuid of Object.keys(vault.entries)) {
    const encryptedEntry = vault.entries[uuid];
    const decryptedEntryString = await cryptoService.decrypt(
      base64ToUint8Array(encryptedEntry.ciphertext),
      base64ToUint8Array(encryptedEntry.iv),
      base64ToUint8Array(encryptedEntry.tag),
    );
    entries.push(JSON.parse(decryptedEntryString));
  }

  return { version: vault.version || "1.0", folders, entries };
};

export const createInitialVault = async (): Promise<DecryptedVault> => {
  return {
    version: "1.0",
    folders: [
      {
        id: "folder-1",
        name: "Trabalho",
        icon: "bi-briefcase",
        colorHex: "#3498db",
      },
      {
        id: "folder-2",
        name: "Casa",
        icon: "bi-briefcase",
        colorHex: "#3498db",
      },
      {
        id: "folder-3",
        name: "Compras",
        icon: "bi-briefcase",
        colorHex: "#3498db",
      },
    ],
    entries: [
      {
        type: "login",
        id: "entry-1",
        title: "Email Principal",
        notes: "",
        foldersIds: ["folder-1", "folder-2"],
        isFavorite: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        username: "meu.email@exemplo.com",
        password: "uma-senha-forte-123",
        url: "https://mail.google.com",
      },
      {
        type: "login",
        id: "entry-2",
        title: "Email Principal",
        notes: "",
        foldersIds: ["folder-2"],
        isFavorite: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        username: "meu.email@exemplo.com",
        password: "uma-senha-forte-123",
        url: "https://mail.google.com",
      },
    ],
  };
};
