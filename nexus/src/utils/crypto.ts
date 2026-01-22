import { argon2id } from "hash-wasm";

export async function deriveKeyFromMasterPassword(
	masterPassword,
	existingSalt = null,
) {
	// 1. Gerar ou recuperar o Salt (16 bytes é o padrão)
	const salt =
		existingSalt || window.crypto.getRandomValues(new Uint8Array(16));

	// 2. Derivar a chave binária
	const derivedKeyBinary = await argon2id({
		password: masterPassword,
		salt: salt,
		parallelism: 1,
		iterations: 3, // Recomendado para Argon2id
		memorySize: 65536, // 64MB (Equilíbrio entre segurança e não travar o browser)
		hashLength: 32, // 32 bytes = 256 bits (necessário para AES-256)
		outputType: "binary", // IMPORTANTE: queremos bytes, não string!
	});

	return {
		key: derivedKeyBinary, // Use isso no window.crypto.subtle.importKey
		salt: salt, // Salve isso junto com o cofre criptografado
	};
}

export async function encryptVault(masterPassword, vaultData) {
	const { key, salt } = await deriveKeyFromMasterPassword(masterPassword);

	// Importar o buffer do hash-wasm para a Web Crypto API
	const cryptoKey = await window.crypto.subtle.importKey(
		"raw",
		key,
		{ name: "AES-GCM" },
		false,
		["encrypt"],
	);

	const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Vetor de inicialização
	const encoder = new TextEncoder();

	const encryptedContent = await window.crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv },
		cryptoKey,
		encoder.encode(JSON.stringify(vaultData)),
	);

	// Retornar tudo o que precisa para ser salvo no JSON/Google Drive
	return {
		ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedContent))),
		salt: btoa(String.fromCharCode(...salt)), // converter para base64 para salvar
		iv: btoa(String.fromCharCode(...iv)),
		params: { m: 65536, t: 3, p: 1 },
	};
}

export async function decryptVault(masterPassword, encryptedData) {
	const { ciphertext, salt, iv, params } = encryptedData;

	// Converter salt e iv de base64 para Uint8Array
	const saltBytes = new Uint8Array(
		atob(salt)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);
	const ivBytes = new Uint8Array(
		atob(iv)
			.split("")
			.map((c) => c.charCodeAt(0)),
	);

	// Derivar a chave usando o salt salvo
	const { key } = await deriveKeyFromMasterPassword(masterPassword, saltBytes);

	// Importar a chave para descriptografia
	const cryptoKey = await window.crypto.subtle.importKey(
		"raw",
		key,
		{ name: "AES-GCM" },
		false,
		["decrypt"],
	);

	// Descriptografar
	const decryptedContent = await window.crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: ivBytes },
		cryptoKey,
		ciphertext,
	);

	// Converter de volta para string JSON
	const decoder = new TextDecoder();
	const jsonString = decoder.decode(decryptedContent);
	return JSON.parse(jsonString);
}
