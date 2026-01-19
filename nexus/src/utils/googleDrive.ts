declare global {
	interface Window {
		google?: {
			accounts: {
				oauth2: {
					initTokenClient: (config: any) => {
						requestAccessToken: (opts?: any) => void;
					};
				};
			};
		};
	}
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const VAULT_FILENAME = "nexus.vault.json";

let accessToken: string | null = null;

export async function getAccessToken(): Promise<string> {
	if (accessToken) {
		return accessToken;
	}

	return new Promise((resolve, reject) => {
		if (!window.google) {
			reject(new Error("Google SDK não carregado. Aguarde e tente novamente."));
			return;
		}

		const tokenClient = window.google.accounts.oauth2.initTokenClient({
			client_id: CLIENT_ID,
			scope: SCOPES,
			callback: (response: any) => {
				if (response.error) {
					reject(new Error(response.error));
				} else {
					accessToken = response.access_token;
					resolve(accessToken);
				}
			},
		});

		// Solicita token com prompt se necessário
		tokenClient.requestAccessToken({ prompt: "consent" });
	});
}

/**
 * Encontra o arquivo vault no appDataFolder
 * Retorna o fileId se existir, null caso contrário
 */
export async function findVaultFile(token: string): Promise<string | null> {
	try {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${VAULT_FILENAME}'&fields=files(id,name)`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(`Erro ao buscar arquivo: ${response.statusText}`);
		}

		const data = await response.json();
		return data.files && data.files.length > 0 ? data.files[0].id : null;
	} catch (error) {
		console.error("Erro ao encontrar vault:", error);
		throw error;
	}
}

/**
 * Faz download do vault do Google Drive
 */
export async function downloadVault(token: string): Promise<any> {
	try {
		const fileId = await findVaultFile(token);
		if (!fileId) {
			throw new Error("Arquivo vault não encontrado no Google Drive");
		}

		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erro ao fazer download:", error);
		throw error;
	}
}

/**
 * Faz upload/atualiza o vault no Google Drive
 */
export async function uploadVault(
	token: string,
	vaultContent: any,
): Promise<void> {
	try {
		const fileId = await findVaultFile(token);
		const jsonString = JSON.stringify(vaultContent);
		const blob = new Blob([jsonString], { type: "application/json" });

		let url: string;
		let method: string;

		if (fileId) {
			// Atualizar arquivo existente
			console.log("Encontrado ID:" + fileId);
			url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
			method = "PATCH";
		} else {
			// Criar novo arquivo
			const metadata = {
				name: VAULT_FILENAME,
				parents: ["appDataFolder"],
			};

			const form = new FormData();
			form.append(
				"metadata",
				new Blob([JSON.stringify(metadata)], { type: "application/json" }),
			);
			form.append("file", blob);

			url =
				"https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
			method = "POST";

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: form,
			});

			if (!response.ok) {
				throw new Error(`Erro ao criar arquivo: ${response.statusText}`);
			}
			return;
		}

		// Upload do arquivo (atualizar existente)
		const response = await fetch(url, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: jsonString,
		});

		if (!response.ok) {
			throw new Error(`Erro ao fazer upload: ${response.statusText}`);
		}
	} catch (error) {
		console.error("Erro ao fazer upload:", error);
		throw error;
	}
}

/**
 * Desconecta do Google (limpa o token)
 */
export function disconnectGoogle(): void {
	accessToken = null;
}

/**
 * Retorna se está conectado ao Google
 */
export function isConnected(): boolean {
	return accessToken !== null;
}
