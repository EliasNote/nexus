import argon2 from "argon2-browser/dist/argon2-bundled.min.js";

type Argon2Params = {
	timeCost: number;
	memoryCost: number;
	parallelism: number;
	hashLen: number;
	saltLen: number;
};

const DEFAULT_ARGON2: Argon2Params = {
	timeCost: 3,
	memoryCost: 65536, // 64 MB
	parallelism: 1,
	hashLen: 32, // 256 bits (AES-256)
	saltLen: 16,
};

export type EncryptedPayload = {
	version: 1;
	alg: "AES-GCM";
	kdf: {
		name: "argon2id";
		params: Argon2Params;
	};
	salt: string; // base64
	iv: string; // base64 (12 bytes)
	ciphertext: string; // base64 (includes GCM tag)
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function randomBytes(length: number): Uint8Array {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return bytes;
}

async function importAesKey(keyBytes: Uint8Array): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, [
		"encrypt",
		"decrypt",
	]);
}

async function deriveKeyBytes(
	password: string,
	salt: Uint8Array,
	params: Argon2Params = DEFAULT_ARGON2,
): Promise<Uint8Array> {
	const result = await argon2.hash({
		pass: password,
		salt,
		time: params.timeCost,
		mem: params.memoryCost,
		parallelism: params.parallelism,
		hashLen: params.hashLen,
		type: argon2.ArgonType.Argon2id,
	});
	return result.hash as Uint8Array;
}

export async function encryptJson(
	password: string,
	data: unknown,
	params: Partial<Argon2Params> = {},
): Promise<EncryptedPayload> {
	const kdfParams: Argon2Params = { ...DEFAULT_ARGON2, ...params };
	const salt = randomBytes(kdfParams.saltLen);
	const iv = randomBytes(12);
	const keyBytes = await deriveKeyBytes(password, salt, kdfParams);
	const key = await importAesKey(keyBytes);
	const plaintext = textEncoder.encode(JSON.stringify(data));
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		plaintext,
	);
	const ciphertext = new Uint8Array(encrypted);

	return {
		version: 1,
		alg: "AES-GCM",
		kdf: {
			name: "argon2id",
			params: kdfParams,
		},
		salt: toBase64(salt),
		iv: toBase64(iv),
		ciphertext: toBase64(ciphertext),
	};
}

export async function decryptJson<T = unknown>(
	password: string,
	payload: EncryptedPayload,
): Promise<T> {
	if (payload.alg !== "AES-GCM" || payload.kdf.name !== "argon2id") {
		throw new Error("Formato de criptografia inválido.");
	}

	const salt = fromBase64(payload.salt);
	const iv = fromBase64(payload.iv);
	const ciphertext = fromBase64(payload.ciphertext);
	const keyBytes = await deriveKeyBytes(password, salt, payload.kdf.params);
	const key = await importAesKey(keyBytes);
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		ciphertext,
	);
	const jsonText = textDecoder.decode(decrypted);
	return JSON.parse(jsonText) as T;
}

export async function encryptString(
	password: string,
	text: string,
	params: Partial<Argon2Params> = {},
): Promise<EncryptedPayload> {
	return encryptJson(password, text, params);
}

export async function decryptString(
	password: string,
	payload: EncryptedPayload,
): Promise<string> {
	return decryptJson<string>(password, payload);
}
