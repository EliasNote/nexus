import type {
  Credential,
  DecryptedVault,
  EncryptedData,
  EncryptedVault,
  EntrySummary,
  LoginCredential,
  VaultSummarizedData,
} from "@/types/vault";
import { expose } from "comlink";
import { argon2id } from "hash-wasm";
import { sha1 } from "js-sha1";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";

let secureKey: CryptoKey | null = null;
const zxcvbn = new ZxcvbnFactory({
  dictionary: {},
  graphs: {},
});

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

  async verifyUnlockVaultKeys(
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

  async verifyCompromised(password: string): Promise<boolean> {
    const hash = sha1(password).toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const compromisedPasswords = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    ).then((res) => res.text());

    return compromisedPasswords.includes(suffix);
  },

  verifyWeak(password: string): boolean {
    const result = zxcvbn.check(password);
    return result.score < 3;
  },

  verifyReused(password: string, decryptedVault: DecryptedVault): boolean {
    const reused = Object.values(decryptedVault.entries).some(
      (entry) => (entry as LoginCredential).password === password,
    );
    return reused;
  },

  verifyReneval(lastPasswordChange: Date): boolean {
    const days = 90;
    const timeSinceLastChange =
      new Date().getTime() - lastPasswordChange.getTime();
    return timeSinceLastChange < days * 24 * 60 * 60 * 1000;
  },

  async getFolderAndEntryData(
    vault: DecryptedVault,
  ): Promise<VaultSummarizedData> {
    const foldersData = vault.folders.map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      colorHex: f.colorHex,
    }));

    const entriesData: EntrySummary[] = await Promise.all(
      vault.entries.map(async (v) => {
        let isCompromised = false;
        let isWeak = false;
        let isReused = false;
        let isRenewal = false;

        const password = v.password;

        if (password) {
          isCompromised = await this.verifyCompromised(password);
          isWeak = this.verifyWeak(password);
          isReused = this.verifyReused(password, vault);
          isRenewal = this.verifyReneval(new Date(v.lastPasswordChange!));
        }

        const entryData = {
          id: v.id,
          type: v.type,
          title: v.title,
          username: v.type === "login" ? v.username : null,
          holderName: v.type === "card" ? v.holderName : null,
          name: v.type === "note" ? v.name : null,
          auditData: {
            isCompromised: isCompromised,
            isWeak: isWeak,
            isReused: isReused,
            isRenewal: isRenewal,
          },
          foldersIds: v.foldersIds,
          isFavorite: v.isFavorite,
          isDeleted: v.isDeleted,
        };
        return entryData;
      }),
    );

    return { folders: foldersData, entries: entriesData };
  },

  async getInitialData(
    encryptedVault: EncryptedVault,
  ): Promise<VaultSummarizedData> {
    const decryptedFolders = await this.decrypt(
      base64ToUint8Array(encryptedVault.folders.ciphertext),
      base64ToUint8Array(encryptedVault.folders.iv),
      base64ToUint8Array(encryptedVault.folders.tag),
    );
    const folders = JSON.parse(decryptedFolders);

    const entries: Credential[] = [];
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

  async getPassword(
    encryptedVault: EncryptedVault,
    id: string,
  ): Promise<string | null> {
    const encryptedEntry = encryptedVault.entries[id];
    if (!encryptedEntry) return null;

    const decryptedStr = await this.getSingleEntry(encryptedEntry);
    const entry = JSON.parse(decryptedStr);

    return entry.password || null;
  },

  async updateVaultFromSummary(
    encryptedVault: EncryptedVault,
    summary: VaultSummarizedData,
  ): Promise<EncryptedVault> {
    const foldersResult = await this.encrypt(JSON.stringify(summary.folders));
    const newFolders: EncryptedData = {
      ciphertext: uint8ArrayToBase64(foldersResult.ciphertext),
      iv: uint8ArrayToBase64(foldersResult.iv),
      tag: uint8ArrayToBase64(foldersResult.tag),
    };

    const newEntries: { [uuid: string]: EncryptedData } = {};
    const summaryMap = new Map(summary.entries.map((e) => [e.id, e]));

    for (const [id, encryptedEntry] of Object.entries(encryptedVault.entries)) {
      const summaryEntry = summaryMap.get(id);

      if (!summaryEntry) {
        continue;
      }

      const decryptedStr = await this.getSingleEntry(encryptedEntry);
      const decryptedEntry = JSON.parse(decryptedStr);

      const mergedEntry = {
        ...decryptedEntry,
        title: summaryEntry.title,
        username:
          summaryEntry.type === "login"
            ? summaryEntry.username
            : decryptedEntry.username,
        holderName:
          summaryEntry.type === "card"
            ? summaryEntry.holderName
            : decryptedEntry.holderName,
        name:
          summaryEntry.type === "note"
            ? summaryEntry.name
            : decryptedEntry.name,
        foldersIds: summaryEntry.foldersIds,
        isFavorite: summaryEntry.isFavorite,
        isDeleted: summaryEntry.isDeleted,
      };

      const encryptedResult = await this.encrypt(JSON.stringify(mergedEntry));
      newEntries[id] = {
        ciphertext: uint8ArrayToBase64(encryptedResult.ciphertext),
        iv: uint8ArrayToBase64(encryptedResult.iv),
        tag: uint8ArrayToBase64(encryptedResult.tag),
      };
    }

    return {
      ...encryptedVault,
      folders: newFolders,
      entries: newEntries,
    };
  },

  async getCredential(
    id: string,
    encryptedVault: EncryptedVault,
  ): Promise<Credential | null> {
    const encryptedEntry = encryptedVault.entries[id];
    if (!encryptedEntry) return null;
    const decryptedStr = await this.getSingleEntry(encryptedEntry);
    return JSON.parse(decryptedStr);
  },

  async updateVaultFromCredential(
    encryptedVault: EncryptedVault,
    credential: Credential,
  ): Promise<EncryptedVault> {
    const updatedEntries = await this.updateEntries(encryptedVault, credential);
    return {
      ...encryptedVault,
      entries: updatedEntries,
    };
  },

  async updateEntries(
    encryptedVault: EncryptedVault,
    credential: Credential,
  ): Promise<{ [uuid: string]: EncryptedData }> {
    const updatedEntries = { ...encryptedVault.entries };

    if (credential) {
      const encryptedResult = await this.encrypt(JSON.stringify(credential));

      updatedEntries[credential.id] = {
        ciphertext: uint8ArrayToBase64(encryptedResult.ciphertext),
        iv: uint8ArrayToBase64(encryptedResult.iv),
        tag: uint8ArrayToBase64(encryptedResult.tag),
      };
    }
    return updatedEntries;
  },
};

export type CryptoService = typeof cryptoService;
expose(cryptoService);
