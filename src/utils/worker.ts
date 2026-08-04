import type {
  Credential,
  DecryptedVault,
  EncryptedData,
  EncryptedVault,
  EncryptedVaultEnvelope,
  EntrySummary,
  Folder,
  LoginCredential,
  VaultSummarizedData,
} from "@/types/vault";
import { expose } from "comlink";
import { argon2id } from "hash-wasm";
import { sha1 } from "js-sha1";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { version } from "./initialVault";

let secureKey: CryptoKey | null = null;
let kekKey: CryptoKey | null = null;
const zxcvbn = new ZxcvbnFactory({
  dictionary: {},
  graphs: {},
});

type CryptoBytes = Uint8Array<ArrayBuffer>;

const createBytes = (length: number): CryptoBytes =>
  new Uint8Array(length) as CryptoBytes;

const bytesFromBuffer = (buffer: ArrayBuffer): CryptoBytes =>
  new Uint8Array(buffer) as CryptoBytes;

const base64ToUint8Array = (base64: string): CryptoBytes => {
  const binaryString = atob(base64);
  const bytes = createBytes(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
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
      ["encrypt", "decrypt"],
    );
    kekBytes.fill(0);
    kekKey = KEK;

    const rawDek = crypto.getRandomValues(createBytes(32));
    secureKey = await crypto.subtle.importKey(
      "raw",
      rawDek.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    const iv = crypto.getRandomValues(createBytes(12));
    const encryptedDekBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      KEK,
      rawDek,
    );
    rawDek.fill(0);

    const encryptedDekBytes = bytesFromBuffer(encryptedDekBuffer);

    return {
      iv: uint8ArrayToBase64(iv),
      tag: uint8ArrayToBase64(encryptedDekBytes.slice(-16)),
      ciphertext: uint8ArrayToBase64(encryptedDekBytes.slice(0, -16)),
    };
  },

  async openVault(
    password: string,
    envelope: EncryptedVaultEnvelope,
  ): Promise<EncryptedVault> {
    secureKey = null;
    kekKey = null;

    const saltBytes = base64ToUint8Array(envelope.kdf.salt);
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
      ["encrypt", "decrypt"],
    );
    kekBytes.fill(0);

    const vaultIv = base64ToUint8Array(envelope.encrypted_vault.iv);
    const vaultCiphertext = base64ToUint8Array(
      envelope.encrypted_vault.ciphertext,
    );
    const vaultTag = base64ToUint8Array(envelope.encrypted_vault.tag);
    const combinedVault = createBytes(vaultCiphertext.length + vaultTag.length);
    combinedVault.set(vaultCiphertext);
    combinedVault.set(vaultTag, vaultCiphertext.length);

    try {
      const vaultBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: vaultIv,
          additionalData: new TextEncoder().encode(
            JSON.stringify({ version: envelope.version, kdf: envelope.kdf }),
          ),
          tagLength: 128,
        },
        KEK,
        combinedVault,
      );
      const encryptedVault = JSON.parse(
        new TextDecoder().decode(vaultBuffer),
      ) as EncryptedVault;

      if (
        JSON.stringify(encryptedVault.kdf) !== JSON.stringify(envelope.kdf)
      ) {
        throw new Error("Configuração KDF inconsistente");
      }

      const dekIv = base64ToUint8Array(encryptedVault.encrypted_dek.iv);
      const dekCiphertext = base64ToUint8Array(
        encryptedVault.encrypted_dek.ciphertext,
      );
      const dekTag = base64ToUint8Array(encryptedVault.encrypted_dek.tag);
      const combinedDek = createBytes(dekCiphertext.length + dekTag.length);
      combinedDek.set(dekCiphertext);
      combinedDek.set(dekTag, dekCiphertext.length);

      const rawDekBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: dekIv, tagLength: 128 },
        KEK,
        combinedDek,
      );

      secureKey = await crypto.subtle.importKey(
        "raw",
        rawDekBuffer,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"],
      );
      kekKey = KEK;

      return encryptedVault;
    } catch (e) {
      secureKey = null;
      kekKey = null;
      throw new Error("Senha incorreta ou cofre corrompido", { cause: e });
    }
  },

  async sealVault(
    vault: EncryptedVault,
  ): Promise<EncryptedVaultEnvelope> {
    if (!kekKey) throw new Error("KEK não importada no Worker");

    const iv = crypto.getRandomValues(createBytes(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: new TextEncoder().encode(
          JSON.stringify({ version, kdf: vault.kdf }),
        ),
        tagLength: 128,
      },
      kekKey,
      new TextEncoder().encode(JSON.stringify(vault)),
    );
    const encryptedBytes = bytesFromBuffer(encryptedBuffer);

    return {
      version,
      kdf: vault.kdf,
      encrypted_vault: {
        iv: uint8ArrayToBase64(iv),
        tag: uint8ArrayToBase64(encryptedBytes.slice(-16)),
        ciphertext: uint8ArrayToBase64(encryptedBytes.slice(0, -16)),
      },
    };
  },

  async encrypt(plaintext: string) {
    if (!secureKey) throw new Error("Chave não importada no Worker");
    const iv = crypto.getRandomValues(createBytes(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      secureKey,
      new TextEncoder().encode(plaintext).buffer as ArrayBuffer,
    );
    const encryptedBytes = bytesFromBuffer(encryptedBuffer);
    return {
      ciphertext: encryptedBytes.slice(0, -16),
      tag: encryptedBytes.slice(-16),
      iv,
    };
  },

  async decrypt(
    ciphertext: CryptoBytes,
    iv: CryptoBytes,
    tag: CryptoBytes,
  ): Promise<string> {
    if (!secureKey) throw new Error("Chave não importada no Worker");
    const combined = createBytes(ciphertext.length + tag.length);
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
    kekKey = null;
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

  verifyReused(
    id: string,
    password: string,
    decryptedVault: DecryptedVault,
  ): { isTrue: boolean; reusedIds: string[] } {
    const reusedIds = Object.values(decryptedVault.entries)
      .filter(
        (entry) =>
          (entry as LoginCredential).password === password && entry.id !== id,
      )
      .map((entry) => entry.id);

    const isTrue = reusedIds.length > 0;
    const groupIds = isTrue
      ? Array.from(new Set([id, ...reusedIds])).sort()
      : [];

    return { isTrue, reusedIds: groupIds };
  },

  verifyReneval(lastPasswordChange: Date): boolean {
    const days = 90;
    const timeSinceLastChange =
      new Date().getTime() - lastPasswordChange.getTime();
    return timeSinceLastChange > days * 24 * 60 * 60 * 1000;
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
        let reusedIds: string[] = [];

        const password = v.password;

        if (password) {
          isCompromised = await this.verifyCompromised(password);
          isWeak = this.verifyWeak(password);
          const result = this.verifyReused(v.id, password, vault);
          isReused = result.isTrue;
          reusedIds = result.reusedIds;
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
          reusedIds: reusedIds,
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

  async updateVaultFromCredentialAndTrackPasswordChange(
    encryptedVault: EncryptedVault,
    credential: Credential,
  ): Promise<EncryptedVault> {
    const previousCredential = await this.getCredential(
      credential.id,
      encryptedVault,
    );
    const now = new Date().toISOString();
    const currentPassword = credential.password ?? "";
    const previousPassword = previousCredential?.password ?? "";
    const shouldTrackPasswordChange =
      currentPassword.length > 0 || previousPassword.length > 0;
    const passwordChanged =
      shouldTrackPasswordChange && currentPassword !== previousPassword;

    const updatedCredential: Credential = {
      ...credential,
      updatedAt: now,
      lastPasswordChange: passwordChanged ? now : credential.lastPasswordChange,
    };

    return this.updateVaultFromCredential(encryptedVault, updatedCredential);
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

  async encryptVault(
    vaultEntries: Credential[],
    folders: Folder[] = [],
  ): Promise<{
    folders: EncryptedData;
    entries: { [uuid: string]: EncryptedData };
  }> {
    const foldersString = JSON.stringify(folders);
    const encryptedFolders = await this.encrypt(foldersString);
    const encryptedFoldersData = {
      iv: uint8ArrayToBase64(encryptedFolders.iv),
      tag: uint8ArrayToBase64(encryptedFolders.tag),
      ciphertext: uint8ArrayToBase64(encryptedFolders.ciphertext),
    };

    const entries: { [uuid: string]: EncryptedData } = {};
    for (const entry of vaultEntries) {
      const entryString = JSON.stringify(entry);
      const result = await this.encrypt(entryString);
      entries[entry.id] = {
        iv: uint8ArrayToBase64(result.iv),
        tag: uint8ArrayToBase64(result.tag),
        ciphertext: uint8ArrayToBase64(result.ciphertext),
      };
    }

    return { folders: encryptedFoldersData, entries };
  },
};

export type CryptoService = typeof cryptoService;
expose(cryptoService);
