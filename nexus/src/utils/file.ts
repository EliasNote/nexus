import { set, get } from "idb-keyval";
import { encryptVault } from "./crypto";
import { vaultPadrao } from "../modelospadrao";

async function saveHandle(handle: FileSystemFileHandle) {
	await set("fileHandle", handle);
}

async function getSavedHandle(): Promise<FileSystemFileHandle | undefined> {
	return await get("fileHandle");
}

async function saveVault(file) {
	const vaultData = {
		content: file,
		savedAt: new Date().toISOString(),
	};
	await set("vault", vaultData);
}

export async function getVault() {
	return get("vault");
}

export async function checkHandleExists(): Promise<boolean> {
	try {
		const fileHandle = await getSavedHandle();
		if (!fileHandle) return false;

		const file = await fileHandle.getFile();
		const content = await file.text();
		saveVault(content);

		console.log(content);

		const permission = await fileHandle.queryPermission({ mode: "read" });
		return permission === "granted";
	} catch (error) {
		console.error("Erro ao verificar handle:", error);
		return false;
	}
}

export async function verifyHandle(fileHandle) {
	if (!fileHandle) return null;

	try {
		const requestPerm = await fileHandle.requestPermission({ mode: "read" });
		if (requestPerm === "granted") return fileHandle;
	} catch (error) {
		console.error("Erro ao verificar handle:", error);
	}

	await set("fileHandle", undefined);
	return null;
}

export async function saveNewFileHandle(password: string) {
	const opts = {
		types: [
			{
				description: "JSON file",
				accept: { "application/json": [".json"] },
			},
		],
		suggestedName: "vault.json",
		startIn: "documents",
	};

	const encripted = await encryptVault(password, vaultPadrao);
	const handle = await window.showSaveFilePicker(opts);
	const writable = await handle.createWritable();
	await writable.write(JSON.stringify(encripted, null, 2));
	await writable.close();
}

// export async function saveNewFileHandle(
// 	password: string = null,
// 	vault: any = null,
// ) {
// 	const opts = {
// 		types: [
// 			{
// 				description: "JSON file",
// 				accept: { "application/json": [".json"] },
// 			},
// 		],
// 		suggestedName: "vault.json",
// 		startIn: "documents",
// 	};

// 	if (file == null) {
// 		file = {
// 			teste: "teste",
// 			senha: "123",
// 		};
// 	}

// 	const encripted = await encryptVault(password, vault);
// 	const handle = await window.showSaveFilePicker(opts);
// 	const writable = await handle.createWritable();
// 	await writable.write(JSON.stringify(encripted, null, 2));
// 	await writable.close();
// }

export async function getFileHandle() {
	let fileHandle = await getSavedHandle();
	fileHandle = await verifyHandle(fileHandle);

	if (fileHandle) {
		try {
			fileHandle = await verifyHandle(fileHandle);
			if (fileHandle) {
				const file = await fileHandle.getFile();
				const content = await file.text();
				console.log("Vault no PC:" + content);
				saveVault(content);
				return fileHandle;
			}
		} catch (error) {
			console.error("Arquivo salvo não encontrado ou inacessível:", error);
			await set("fileHandle", undefined);
		}
	}

	const pickerOpts = {
		types: [
			{
				description: "JSON file",
				accept: {
					"application/json": [".json"],
				},
			},
		],
		excludeAcceptAllOption: true,
		multiple: false,
	};

	[fileHandle] = await window.showOpenFilePicker(pickerOpts);
	await saveHandle(fileHandle);
	const file = await fileHandle.getFile();
	const content = await file.text();
	saveVault(content);

	console.log(content);

	console.log(fileHandle);

	return content;
}

export async function getNewFile() {
	let fileHandle = await getSavedHandle();

	const pickerOpts = {
		types: [
			{
				description: "JSON file",
				accept: {
					"application/json": [".json"],
				},
			},
		],
		excludeAcceptAllOption: true,
		multiple: false,
	};

	[fileHandle] = await window.showOpenFilePicker(pickerOpts);
	await saveHandle(fileHandle);
	const file = await fileHandle.getFile();
	const content = await file.text();
	saveVault(content);

	console.log(content);

	console.log(fileHandle);

	return content;
}
