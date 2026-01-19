/* eslint-disable @typescript-eslint/no-explicit-any */

// Declarações globais para File System Access API
declare global {
	interface Window {
		showSaveFilePicker?: any;
		showOpenFilePicker?: any;
	}
}

const DB_NAME = "PasswordManagerDB";
const STORE_NAME = "handles";
const DB_VERSION = 1;

/**
 * Abre/cria o banco IndexedDB para armazenar file handles
 */
async function getDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
	});
}

/**
 * Armazena um FileSystemFileHandle no IndexedDB
 */
async function storeHandle(
	id: string,
	handle: FileSystemFileHandle,
): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put({ id, handle });

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Recupera um FileSystemFileHandle do IndexedDB
 */
async function getStoredHandle(
	id: string,
): Promise<FileSystemFileHandle | null> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(id);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			const result = request.result;
			resolve(result ? result.handle : null);
		};
	});
}

/**
 * Verifica e solicita permissão de um file handle
 */
export async function verifyPermission(
	handle: FileSystemFileHandle,
	mode: "read" | "readwrite",
): Promise<boolean> {
	const options: any = { mode };

	// Verifica se já tem permissão
	if ((await handle.queryPermission(options)) === "granted") {
		return true;
	}

	// Solicita permissão
	if ((await handle.requestPermission(options)) === "granted") {
		return true;
	}

	return false;
}

/**
 * Verifica se a File System Access API está disponível
 */
function isFileSystemAccessSupported(): boolean {
	return "showSaveFilePicker" in window && "showOpenFilePicker" in window;
}

/**
 * Salva dados JSON em um arquivo local usando File System Access API
 * com persistência do handle para evitar prompts repetidos
 *
 * @param data - Objeto a ser salvo como JSON
 * @param fileId - ID único para identificar o arquivo (default: 'vault')
 */
export async function saveJsonFile(
	data: any,
	fileId: string = "vault",
	preferredStartDir?: WellKnownDirectory | FileSystemDirectoryHandle, // Opcional: passe "documents", "downloads", etc.
): Promise<void> {
	try {
		if (!isFileSystemAccessSupported()) {
			throw new Error("File System Access API não suportada neste navegador");
		}

		let handle = await getStoredHandle(fileId);

		if (!handle) {
			const pickerOptions: SaveFilePickerOptions = {
				suggestedName: `${fileId}.json`,
				types: [
					{
						description: "JSON Files",
						accept: { "application/json": [".json"] },
					},
				],
			};

			// Adiciona startIn se fornecido (diretório sugerido inicial)
			if (preferredStartDir) {
				pickerOptions.startIn = preferredStartDir; // Pode ser string como "documents" ou um DirectoryHandle
			}

			// Opcional: adicione um ID persistente para lembrar o último diretório usado para esse tipo de arquivo
			// pickerOptions.id = "password-vault-files";  // Browser lembra separadamente por ID

			handle = await window.showSaveFilePicker(pickerOptions);
			await storeHandle(fileId, handle);
		}

		const hasPermission = await verifyPermission(handle, "readwrite");
		if (!hasPermission) {
			throw new Error("Permissão de escrita negada pelo usuário");
		}

		const writable = await handle.createWritable();
		await writable.write(JSON.stringify(data, null, 2));
		await writable.close();

		console.log(`Arquivo ${fileId}.json salvo com sucesso`);
	} catch (error: any) {
		if (error.name === "AbortError") {
			console.log("Usuário cancelou a operação de salvar");
			throw new Error("Operação cancelada pelo usuário");
		}
		console.error("Erro ao salvar arquivo:", error);
		throw error;
	}
}

/**
 * Lê dados JSON de um arquivo local usando File System Access API
 * com persistência do handle para evitar prompts repetidos
 *
 * @param fileId - ID único para identificar o arquivo (default: 'vault')
 * @returns Objeto parseado do JSON
 */
export async function readJsonFile(fileId: string = "vault"): Promise<any> {
	try {
		if (!isFileSystemAccessSupported()) {
			throw new Error("File System Access API não suportada neste navegador");
		}

		// Tenta recuperar handle armazenado
		let handle = await getStoredHandle(fileId);

		// Se não houver handle, solicita ao usuário
		if (!handle) {
			const handles = await window.showOpenFilePicker({
				types: [
					{
						description: "JSON Files",
						accept: { "application/json": [".json"] },
					},
				],
				multiple: false,
			});

			handle = handles[0];

			// Armazena o handle para uso futuro
			await storeHandle(fileId, handle);
		}

		// Verifica e solicita permissão de leitura
		const hasPermission = await verifyPermission(handle, "read");
		if (!hasPermission) {
			throw new Error("Permissão de leitura negada pelo usuário");
		}

		// Lê o arquivo
		const file = await handle.getFile();
		const text = await file.text();
		const data = JSON.parse(text);

		console.log(`Arquivo ${fileId}.json lido com sucesso`);
		return data;
	} catch (error: any) {
		if (error.name === "AbortError") {
			console.log("Usuário cancelou a operação de abrir");
			throw new Error("Operação cancelada pelo usuário");
		}
		console.error("Erro ao ler arquivo:", error);
		throw error;
	}
}

/**
 * Remove o handle armazenado para um arquivo específico
 * Útil quando o usuário quer escolher um novo arquivo
 */
export async function clearStoredHandle(
	fileId: string = "vault",
): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.delete(fileId);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			console.log(`Handle para ${fileId} removido com sucesso`);
			resolve();
		};
	});
}
