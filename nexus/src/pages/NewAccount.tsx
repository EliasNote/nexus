import { useEffect, useRef, useState } from "react";
import {
	readJsonFile,
	saveJsonFile,
	clearStoredHandle,
	verifyPermission,
} from "../utils/jsonFile";
import {
	getAccessToken,
	downloadVault,
	uploadVault,
	isConnected,
	disconnectGoogle,
} from "../utils/googleDrive";
import { decryptJson, encryptJson } from "../utils/crypto";
import { useLocation } from "react-router-dom";

export default function NewAccount() {
	const [connected, setConnected] = useState(false);
	const [loading, setLoading] = useState(false);
	const [vaultData, setVaultData] = useState<any>(null);
	const [jsonText, setJsonText] = useState<string>("");
	const readLocalFile = useRef(false);
	const location = useLocation();
	const password = location.state?.password;

	const handleSaveLocal = async () => {
		try {
			console.log("Salvando\nSenha:" + password);
			setLoading(true);
			const encripted = await encryptJson(password, vaultData);
			await saveJsonFile(encripted, "vault", "documents");
			setVaultData(encripted);
			alert("Vault salvo localmente! (sem prompt na próxima vez)");
		} catch (error) {
			console.error("Erro ao salvar:", error);
			alert("Erro ao salvar vault local");
		} finally {
			setLoading(false);
		}
	};

	const handleConnect = async () => {
		try {
			setLoading(true);
			await getAccessToken();
			setConnected(true);
			console.log("Conectado ao Google Drive!");
		} catch (error) {
			console.error("Erro ao conectar:", error);
			alert("Erro ao conectar ao Google Drive");
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async () => {
		try {
			setLoading(true);
			const token = await getAccessToken();
			const vault = await downloadVault(token);
			console.log("Vault baixado (Drive):", vault);
			await saveJsonFile(vault, "vault");
			setVaultData(vault);
			alert("Vault baixado e salvo localmente!");
		} catch (error) {
			console.error("Erro ao baixar:", error);
			alert("Erro ao baixar vault");
		} finally {
			setLoading(false);
		}
	};

	const handleUpload = async () => {
		try {
			setLoading(true);
			const token = await getAccessToken();
			await uploadVault(token, { senha: "abc123", teste: "dados" });
			console.log("Vault enviado!");
			alert("Vault enviado com sucesso!");
		} catch (error) {
			console.error("Erro ao enviar:", error);
			alert("Erro ao enviar vault");
		} finally {
			setLoading(false);
		}
	};

	const handleDisconnect = () => {
		disconnectGoogle();
		setConnected(false);
		console.log("Desconectado!");
	};

	const handleReadLocal = async () => {
		try {
			setLoading(true);
			const data = await readJsonFile("vault");
			const decrypt = decryptJson(password, data);
			setVaultData(decrypt);
			setJsonText(JSON.stringify(decrypt, null, 2));
			console.log("Vault lido:", decrypt);
		} catch (error) {
			console.error("Erro ao ler:", error);
			alert("Erro ao ler vault local");
		} finally {
			setLoading(false);
		}
	};

	const handleClearHandle = async () => {
		try {
			setLoading(true);
			await clearStoredHandle("vault");
			setVaultData(null);
			alert("Handle removido! Próximo save/read vai pedir arquivo novamente.");
		} catch (error) {
			console.error("Erro ao limpar:", error);
			alert("Erro ao limpar handle");
		} finally {
			setLoading(false);
		}
	};

	const encrypt = async (pwd: string) => {
		try {
			const encripted = await encryptJson(pwd, vaultData);
			console.log(pwd);
			console.log(encripted);
		} catch (error) {
			console.error("Erro ao limpar:", error);
			alert("Erro ao limpar handle");
		}
	};

	useEffect(() => {
		if (location.state?.vaultData) {
			setVaultData(location.state.vaultData);
			setJsonText(JSON.stringify(location.state.vaultData, null, 2));
		} else if (!readLocalFile.current) {
			handleReadLocal();
			readLocalFile.current = true;
		}
	}, [location.state]);

	return (
		<section className="bg-black w-full h-full flex items-center justify-center overflow-auto">
			<div className="flex flex-col gap-4 max-w-2xl p-4">
				<h1 className="text-white text-2xl font-bold">Teste de Persistência</h1>

				{/* Editor de JSON */}
				<div className="flex flex-col gap-2 bg-gray-900 p-4 rounded">
					<label className="text-white font-semibold mb-1">
						Editar JSON do Vault:
					</label>
					<textarea
						className="w-full h-40 p-2 rounded bg-gray-800 text-white font-mono text-sm resize-y border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={jsonText}
						onChange={(e) => setJsonText(e.target.value)}
						spellCheck={false}
					/>
					<div className="flex gap-2 mt-2">
						<button
							className="bg-green-500 text-black px-3 py-1 rounded disabled:opacity-50 hover:bg-green-600"
							disabled={loading}
							onClick={() => {
								try {
									const parsed = JSON.parse(jsonText);
									setVaultData(parsed);
									alert(
										"JSON atualizado no estado! Clique em Salvar Local para persistir.",
									);
								} catch (e) {
									alert("JSON inválido!");
								}
							}}
						>
							Atualizar Estado
						</button>
						<button
							className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50 hover:bg-blue-600"
							disabled={loading}
							onClick={() => {
								if (vaultData) setJsonText(JSON.stringify(vaultData, null, 2));
							}}
						>
							Resetar do Estado
						</button>
					</div>
				</div>

				{vaultData && (
					<div className="bg-gray-800 text-white p-4 rounded">
						<h3 className="font-bold mb-2">Dados do Vault:</h3>
						<pre className="text-sm overflow-auto">
							{JSON.stringify(vaultData, null, 2)}
						</pre>
					</div>
				)}

				<div className="flex gap-3 flex-wrap">
					<button
						className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
						onClick={handleSaveLocal}
						disabled={loading}
					>
						{loading ? "Salvando..." : "💾 Salvar Local"}
					</button>
					<button
						className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
						onClick={handleReadLocal}
						disabled={loading}
					>
						{loading ? "Lendo..." : "📂 Abrir Local"}
					</button>
					<button
						className="bg-orange-500 text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-orange-600"
						onClick={handleClearHandle}
						disabled={loading}
					>
						🗑️ Limpar Handle
					</button>
				</div>

				<div className="flex gap-3 flex-wrap border-t border-white pt-4">
					<button
						className={`px-4 py-2 rounded text-black disabled:opacity-50 ${
							connected ? "bg-green-500" : "bg-blue-500"
						}`}
						onClick={handleConnect}
						disabled={loading || connected}
					>
						{loading
							? "Conectando..."
							: connected
								? "Conectado ✓"
								: "Conectar Google Drive"}
					</button>

					{connected && (
						<>
							<button
								className="bg-yellow-500 text-black px-4 py-2 rounded disabled:opacity-50"
								onClick={handleUpload}
								disabled={loading}
							>
								{loading ? "Enviando..." : "Upload para Drive"}
							</button>
							<button
								className="bg-yellow-500 text-black px-4 py-2 rounded disabled:opacity-50"
								onClick={handleDownload}
								disabled={loading}
							>
								{loading ? "Baixando..." : "Download do Drive"}
							</button>
							<button
								className="bg-red-500 text-black px-4 py-2 rounded disabled:opacity-50"
								onClick={handleDisconnect}
								disabled={loading}
							>
								Desconectar
							</button>
						</>
					)}
				</div>
			</div>
		</section>
	);
}
