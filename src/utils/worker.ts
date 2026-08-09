import type {
  Credential,
  EncryptedData,
  Vault,
  EncryptedVault,
  EntrySummary,
  LoginCredential,
  VaultSummarizedData,
  Directory,
} from "@/types/vault";
import { expose } from "comlink";
import { argon2id } from "hash-wasm";
import { sha1 } from "js-sha1";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { getBaseVault, version } from "./initialVault";

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

const verifyCompromised = async (password: string): Promise<boolean> => {
  const hash = sha1(password).toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const compromisedPasswords = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
  ).then((res) => res.text());

  return compromisedPasswords.includes(suffix);
};

const verifyWeak = (password: string): boolean => {
  const result = zxcvbn.check(password);
  return result.score < 3;
};

const verifyReused = (
  id: string,
  password: string,
  credentials: Credential[],
): { isTrue: boolean; reusedIds: string[] } => {
  const reusedIds = credentials
    .filter(
      (credential) =>
        (credential as LoginCredential).password === password && credential.id !== id,
    )
    .map((credential) => credential.id);

  const isTrue = reusedIds.length > 0;
  const groupIds = isTrue
    ? Array.from(new Set([id, ...reusedIds])).sort()
    : [];

  return { isTrue, reusedIds: groupIds };
};

const verifyReneval = (lastPasswordChange: Date): boolean => {
  const days = 90;
  const timeSinceLastChange =
    new Date().getTime() - lastPasswordChange.getTime();
  return timeSinceLastChange > days * 24 * 60 * 60 * 1000;
}

const encryptData = async (plaintext: string): Promise<EncryptedData> => {
  if (!secureKey) throw new Error("Chave não importada no Worker");
  const iv = crypto.getRandomValues(createBytes(12));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    secureKey,
    new TextEncoder().encode(plaintext).buffer as ArrayBuffer,
  );
  const encryptedBytes = bytesFromBuffer(encryptedBuffer);
  return {
    ciphertext: uint8ArrayToBase64(encryptedBytes.slice(0, -16)),
    tag: uint8ArrayToBase64(encryptedBytes.slice(-16)),
    iv: uint8ArrayToBase64(iv),
  };
};

const decryptData = async (data: EncryptedData): Promise<string> => {
  if (!secureKey) throw new Error("Chave não importada no Worker");
  const ciphertext = base64ToUint8Array(data.ciphertext);
  const iv = base64ToUint8Array(data.iv);
  const tag = base64ToUint8Array(data.tag);
  const combined = createBytes(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    secureKey,
    combined.buffer as ArrayBuffer,
  );
  return new TextDecoder().decode(decryptedBuffer);
};

const cryptoService = {
  async setupInitialVault(password: string): Promise<Vault> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltBase64 = uint8ArrayToBase64(salt);
    const saltBytes = base64ToUint8Array(saltBase64);

    const kdf = {
      salt: saltBase64,
      memory: 65536,
      iterations: 3,
      parallelism: 1,
    };

    const kekBytes = await argon2id({
      password,
      salt: saltBytes,
      iterations: kdf.iterations,
      memorySize: kdf.memory,
      parallelism: kdf.parallelism,
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

    const encryptedDek: EncryptedData = {
        iv: uint8ArrayToBase64(iv),
        tag: uint8ArrayToBase64(encryptedDekBytes.slice(-16)),
        ciphertext: uint8ArrayToBase64(encryptedDekBytes.slice(0, -16)),
    };

    return await getBaseVault(kdf, encryptedDek, await encryptData("[]"));
  },

  async decryptVault(
    password: string,
    envelope: EncryptedVault,
  ): Promise<Vault> {
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
      ) as Vault;

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

  async encryptVault(
    vault: Vault,
  ): Promise<EncryptedVault> {
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

  async destroyKey() {
    secureKey = null;
    kekKey = null;
  },

  async getSingleEntry(encryptedEntry: EncryptedData): Promise<string> {
    return await decryptData(encryptedEntry);
  },

  async getInitialData(
    vault: Vault,
  ): Promise<VaultSummarizedData> {
    const directories: Directory[] = JSON.parse(await decryptData(vault.directories));
    const directoriesData = directories.map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      colorHex: f.colorHex,
    }));

    const credentials: Credential[] = await Promise.all(
      Object.values(vault.credentials).map(async (encryptedEntry) =>
        JSON.parse(await decryptData(encryptedEntry)),
      ),
    );

    const credentialsData: EntrySummary[] = await Promise.all(
      credentials.map(async (c) => {
        let isCompromised = false;
        let isWeak = false;
        let isReused = false;
        let isRenewal = false;
        let reusedIds: string[] = [];

        const password = c.password;

        if (password) {
          isCompromised = await verifyCompromised(password);
          isWeak = verifyWeak(password);
          const result = verifyReused(c.id, password, credentials);
          isReused = result.isTrue;
          reusedIds = result.reusedIds;
          isRenewal = verifyReneval(new Date(c.lastPasswordChange!));
        }

        const entryData: EntrySummary = {
          id: c.id,
          type: c.type,
          title: c.title,
          autoSaveInterval: vault.autoSaveInterval,
          username: c.type === "login" ? c.username : null,
          holderName: c.type === "card" ? c.holderName : null,
          name: c.type === "note" ? c.name : null,
          auditInfo: {
            isCompromised: isCompromised,
            isWeak: isWeak,
            isReused: isReused,
            isRenewal: isRenewal,
          },
          reusedIds: reusedIds,
          directoriesIds: c.directoriesIds,
          isFavorite: c.isFavorite,
          isDeleted: c.isDeleted,
        };
        return entryData;
      }),
    );

    return { directories: directoriesData, credentials: credentialsData };
  },

  async getPassword(
    encryptedVault: Vault,
    id: string,
  ): Promise<string | null> {
    const encryptedEntry = encryptedVault.credentials[id];
    if (!encryptedEntry) return null;

    const decryptedStr = await this.getSingleEntry(encryptedEntry);
    const entry = JSON.parse(decryptedStr);

    return entry.password || null;
  },

  async updateVaultFromSummary(
    encryptedVault: Vault,
    summary: VaultSummarizedData,
  ): Promise<Vault> {
    const newDirectories = await encryptData(
      JSON.stringify(summary.directories),
    );

    const newCredentials: { [uuid: string]: EncryptedData } = {};
    const summaryMap = new Map(summary.credentials.map((e) => [e.id, e]));

    for (const [id, encryptedEntry] of Object.entries(encryptedVault.credentials)) {
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
        directoriesIds: summaryEntry.directoriesIds,
        isFavorite: summaryEntry.isFavorite,
        isDeleted: summaryEntry.isDeleted,
      };

      newCredentials[id] = await encryptData(JSON.stringify(mergedEntry));
    }

    return {
      ...encryptedVault,
      directories: newDirectories,
      credentials: newCredentials,
    };
  },

  async getCredential(
    id: string,
    encryptedVault: Vault,
  ): Promise<Credential | null> {
    const encryptedEntry = encryptedVault.credentials[id];
    if (!encryptedEntry) return null;
    const decryptedStr = await this.getSingleEntry(encryptedEntry);
    return JSON.parse(decryptedStr);
  },

  async updateVaultFromCredential(
    encryptedVault: Vault,
    credential: Credential,
  ): Promise<Vault> {
    const updatedCredentials = await this.updateCredentials(encryptedVault, credential);
    return {
      ...encryptedVault,
      credentials: updatedCredentials,
    };
  },

  async updateVaultFromCredentialAndTrackPasswordChange(
    encryptedVault: Vault,
    credential: Credential,
  ): Promise<Vault> {
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

  async updateCredentials(
    encryptedVault: Vault,
    credential: Credential,
  ): Promise<{ [uuid: string]: EncryptedData }> {
    const updatedCredentials = { ...encryptedVault.credentials };

    if (credential) {
      updatedCredentials[credential.id] = await encryptData(
        JSON.stringify(credential),
      );
    }
    return updatedCredentials;
  },

};

export type CryptoService = typeof cryptoService;
expose(cryptoService);
