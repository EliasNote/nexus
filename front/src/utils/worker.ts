import { expose } from "comlink";

let secureKey: CryptoKey | null = null;

const cryptoService = {
  async importKey(rawBytes: Uint8Array) {
    secureKey = await crypto.subtle.importKey(
      "raw",
      rawBytes.buffer as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
    rawBytes.fill(0);
  },

  async encrypt(
    plaintext: string,
  ): Promise<{ ciphertext: Uint8Array; tag: Uint8Array; iv: Uint8Array }> {
    if (!secureKey) throw new Error("Chave não importada no Worker");

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer as ArrayBuffer,
      },
      secureKey,
      plaintextBuffer.buffer as ArrayBuffer,
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const tag = encryptedBytes.slice(encryptedBytes.length - 16);
    const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);

    return {
      ciphertext,
      tag,
      iv,
    };
  },

  async decrypt(
    ciphertext: Uint8Array,
    iv: Uint8Array,
    tag: Uint8Array,
  ): Promise<string> {
    if (!secureKey) throw new Error("Chave não importada no Worker");

    const encryptedDataWithTag = new Uint8Array(ciphertext.length + tag.length);
    encryptedDataWithTag.set(ciphertext);
    encryptedDataWithTag.set(tag, ciphertext.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer as ArrayBuffer,
        tagLength: 128,
      },
      secureKey,
      encryptedDataWithTag.buffer as ArrayBuffer,
    );

    return new TextDecoder().decode(decryptedBuffer);
  },

  async destroyKey() {
    secureKey = null;
  },
};

export type CryptoService = typeof cryptoService;
expose(cryptoService);
