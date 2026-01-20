import { useState, useRef } from "react";
import { decryptJson, encryptJson } from "../utils/crypto";
import { readJsonFile, saveJsonFile } from "../utils/jsonFile";
import { useNavigate } from "react-router-dom";

export default function Senha() {
	const [password, setPassword] = useState<string>("");
	const passwordInputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [vaultData, setVaultData] = useState<any>(null);
	const navigate = useNavigate();
	const [jsonText, setJsonText] = useState<string>("");

	const decrypt = async (pwd: string) => {
		try {
			console.log("Descriptografando\nSenha:" + pwd);
			const decrypt = await decryptJson(pwd, vaultData);
			setVaultData(decrypt);
			setJsonText(JSON.stringify(decrypt, null, 2));
			console.log("Descriptografia Sucesso!");
			navigate("/new-account", {
				state: { password: pwd, vaultData: decrypt },
			});
		} catch (e) {
			console.log("Descriptografia deu Errado", e);
		}
	};

	const handleReadLocal = async () => {
		try {
			setLoading(true);
			const data = await readJsonFile("vault");
			setVaultData(data);
			console.log("Vault Achado!");
		} catch (error) {
			console.error("Erro ao ler:", error);
			alert("Erro ao ler vault local");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveLocal = async (pwd: string) => {
		try {
			console.log("Salvando\nSenha:" + pwd);
			setLoading(true);
			const dataToSave = {
				senha: "minhaSenha123",
				username: "usuario@exemplo.com",
				teste1: "asndaoisdnaosid",
				caraca: "123",
				timestamp: new Date().toISOString(),
			};
			const encripted = await encryptJson(pwd, dataToSave);
			await saveJsonFile(encripted, "vault", "documents");
			setVaultData(encripted);
			setPassword(pwd);
			alert("Vault salvo localmente! (sem prompt na próxima vez)");
		} catch (error) {
			console.error("Erro ao salvar:", error);
			alert("Erro ao salvar vault local");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="bg-black w-full h-full flex items-center justify-center overflow-auto">
			<input
				type="password"
				className="p-2 rounded bg-gray-800 text-white font-mono text-sm resize-y border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				ref={passwordInputRef}
				placeholder="Digite a senha mestra"
				spellCheck={false}
			/>
			<button
				className="px-4 py-2 rounded text-black disabled:opacity-50 bg-blue-500"
				onClick={() => {
					if (passwordInputRef.current) {
						const pwd = passwordInputRef.current.value;
						if (pwd.trim() === "") {
							return;
						}
						decrypt(pwd);
					}
				}}
			>
				Entrar
			</button>
			<button
				className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
				onClick={handleReadLocal}
				disabled={loading}
			>
				{loading ? "Lendo..." : "📂 Abrir Local"}
			</button>
			<button
				className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
				onClick={() => {
					if (passwordInputRef.current) {
						const pwd = passwordInputRef.current.value;
						if (pwd.trim() === "") {
							return;
						}
						handleSaveLocal(pwd);
					}
				}}
				disabled={loading}
			>
				{loading ? "Salvando..." : "💾 Salvar Local"}
			</button>
		</section>
	);
}
