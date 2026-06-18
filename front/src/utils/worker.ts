import type {
  DecryptedVault,
  EncryptedData,
  EncryptedVault,
} from "@/types/vault";
import { expose } from "comlink";
import { argon2id } from "hash-wasm";

let secureKey: CryptoKey | null = null;

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const cryptoService = {
  async setupVaultKeys(password: string, saltBase64: string) {
    const saltBytes = base64ToUint8Array(saltBase64);

    const kekBytes = await argon2id({
      password,
      salt: saltBytes,
      iterations: 3,
      memorySize: 65536,
      parallelism: 1,
      hashLength: 32,
      outputType: "binary",
    });

    const KEK = await crypto.subtle.importKey(
      "raw",
      kekBytes.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );
    kekBytes.fill(0);

    const rawDek = crypto.getRandomValues(new Uint8Array(32));
    secureKey = await crypto.subtle.importKey(
      "raw",
      rawDek.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedDekBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      KEK,
      rawDek,
    );
    rawDek.fill(0);

    const encryptedDekBytes = new Uint8Array(encryptedDekBuffer);

    return {
      iv: uint8ArrayToBase64(iv),
      tag: uint8ArrayToBase64(encryptedDekBytes.slice(-16)),
      ciphertext: uint8ArrayToBase64(encryptedDekBytes.slice(0, -16)),
    };
  },

  async unlockVaultKeys(
    password: string,
    saltBase64: string,
    encryptedDek: any,
  ): Promise<boolean> {
    const saltBytes = base64ToUint8Array(saltBase64);

    const kekBytes = await argon2id({
      password,
      salt: saltBytes,
      iterations: 3,
      memorySize: 65536,
      parallelism: 1,
      hashLength: 32,
      outputType: "binary",
    });

    const KEK = await crypto.subtle.importKey(
      "raw",
      kekBytes.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );
    kekBytes.fill(0);

    const iv = base64ToUint8Array(encryptedDek.iv);
    const ciphertext = base64ToUint8Array(encryptedDek.ciphertext);
    const tag = base64ToUint8Array(encryptedDek.tag);

    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext);
    combined.set(tag, ciphertext.length);

    try {
      const rawDekBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv, tagLength: 128 },
        KEK,
        combined,
      );

      secureKey = await crypto.subtle.importKey(
        "raw",
        rawDekBuffer,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"],
      );

      return true;
    } catch (e) {
      throw new Error("Senha incorreta ou cofre corrompido", { cause: e });
    }
  },

  async encrypt(plaintext: string) {
    if (!secureKey) throw new Error("Chave não importada no Worker");
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      secureKey,
      new TextEncoder().encode(plaintext).buffer as ArrayBuffer,
    );
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    return {
      ciphertext: encryptedBytes.slice(0, -16),
      tag: encryptedBytes.slice(-16),
      iv,
    };
  },

  async decrypt(
    ciphertext: Uint8Array,
    iv: Uint8Array,
    tag: Uint8Array,
  ): Promise<string> {
    if (!secureKey) throw new Error("Chave não importada no Worker");
    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext);
    combined.set(tag, ciphertext.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer, tagLength: 128 },
      secureKey,
      combined.buffer as ArrayBuffer,
    );
    return new TextDecoder().decode(decryptedBuffer);
  },

  async destroyKey() {
    secureKey = null;
  },

  async getSingleEntry(encryptedEntry: EncryptedData): Promise<string> {
    return await this.decrypt(
      base64ToUint8Array(encryptedEntry.ciphertext),
      base64ToUint8Array(encryptedEntry.iv),
      base64ToUint8Array(encryptedEntry.tag),
    );
  },

  async getFolderAndEntryData(vault: DecryptedVault) {
    const foldersData = vault.folders.map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      colorHex: f.colorHex,
    }));

    const entriesData = vault.entries.map((v) => {
      const entryData = {
        id: v.id,
        title: v.title,
        username: v.type === "login" ? v.username : null,
        foldersIds: v.foldersIds,
        isFavorite: v.isFavorite,
        isDeleted: v.isDeleted,
      };
      return entryData;
    });

    return { folders: foldersData, entries: entriesData };
  },

  async getInitialData(encryptedVault: EncryptedVault) {
    const decryptedFolders = await this.decrypt(
      base64ToUint8Array(encryptedVault.folders.ciphertext),
      base64ToUint8Array(encryptedVault.folders.iv),
      base64ToUint8Array(encryptedVault.folders.tag),
    );
    const folders = JSON.parse(decryptedFolders);

    const entries = [];
    for (const encryptedEntry of Object.values(encryptedVault.entries)) {
      const decryptedEntryStr = await this.getSingleEntry(encryptedEntry);

      entries.push(JSON.parse(decryptedEntryStr));
    }

    const tempDecryptedVault: DecryptedVault = {
      version: encryptedVault.version,
      folders,
      entries,
    };

    return await this.getFolderAndEntryData(tempDecryptedVault);
  },
};

export type CryptoService = typeof cryptoService;
expose(cryptoService);
