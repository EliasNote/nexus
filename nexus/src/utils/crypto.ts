import { argon2id } from "hash-wasm";

export async function deriveKey(
	masterPassword: string,
	existingSalt: Uint8Array | null = null,
) {
	if (typeof masterPassword !== "string" || masterPassword.trim() === "") {
		throw new Error("Senha mestra inválida ou vazia");
	}
	const salt = existingSalt || crypto.getRandomValues(new Uint8Array(16));
	const derivedKeyArray = await argon2id({
		password: masterPassword,
		salt,
		parallelism: 1, // Seguro no browser
		iterations: 3, // Balanceado
		memorySize: 65536, // 64 MiB
		hashLength: 32, // 256 bits
		outputType: "binary",
	});
	return { key: new Uint8Array(derivedKeyArray), salt };
}

export async function encryptVault(masterPassword: string, vaultData: any) {
	if (!vaultData || typeof vaultData !== "object") {
		throw new Error("Dados do vault inválidos");
	}
	const { key, salt } = await deriveKey(masterPassword);
	const importedKey = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "AES-GCM" },
		false,
		["encrypt"],
	);
	const iv = crypto.getRandomValues(new Uint8Array(12)); // IV único e aleatório
	const encodedData = new TextEncoder().encode(JSON.stringify(vaultData));

	const encryptedBuffer = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		importedKey,
		encodedData,
	);

	const encryptedArray = new Uint8Array(encryptedBuffer);
	const tag = encryptedArray.slice(-16);
	const ciphertext = encryptedArray.slice(0, -16);

	return {
		version: "1.0",
		kdf: {
			algorithm: "argon2id",
			params: { m: 65536, t: 3, p: 1 },
			salt: btoa(String.fromCharCode(...salt)),
		},
		crypto: {
			algorithm: "aes-256-gcm",
			iv: btoa(String.fromCharCode(...iv)),
			tag: btoa(String.fromCharCode(...tag)),
		},
		data: btoa(String.fromCharCode(...ciphertext)),
	};
}

export async function decryptVault(masterPassword: string, encryptedData: any) {
	const salt = Uint8Array.from(
		atob(encryptedData.kdf.salt)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);
	const iv = Uint8Array.from(
		atob(encryptedData.crypto.iv)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);
	const tag = Uint8Array.from(
		atob(encryptedData.crypto.tag)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);
	const ciphertext = Uint8Array.from(
		atob(encryptedData.data)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);

	const fullCiphertext = new Uint8Array(ciphertext.length + tag.length);
	fullCiphertext.set(ciphertext);
	fullCiphertext.set(tag, ciphertext.length);

	const { key } = await deriveKey(masterPassword, salt);
	const importedKey = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "AES-GCM" },
		false,
		["decrypt"],
	);

	try {
		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			importedKey,
			fullCiphertext,
		);
		const decryptedText = new TextDecoder().decode(decryptedBuffer);
		return JSON.parse(decryptedText);
	} catch (error) {
		throw new Error(
			"Descriptografia falhou: Senha incorreta ou arquivo corrompido",
		);
	}
}
