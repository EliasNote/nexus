import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	checkHandleExists,
	getFileHandle,
	getNewFile,
	saveNewFileHandle,
} from "../utils/file";
import { encryptVault } from "../utils/crypto";

export default function Senha() {
	const passwordInputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [hasStoredHandle, setHasStoredHandle] = useState(false);
	const [vault, setVault] = useState<any>();
	const [password, setPassword] = useState<string>();
	const navigate = useNavigate();
	// const [vault, setVault] = useState<VaultData | undefined>();

	// async function fetchVault() {
	// 	const tempVault = await getVault();
	// 	console.log("Vault em Memória:" + tempVault.content);
	// 	if (tempVault) setVault(tempVault);
	// }

	async function checkHandle() {
		const exists = await checkHandleExists();
		console.log("Permissão: " + exists);
		setHasStoredHandle(exists);
		// if (exists) await verifyHandle();
	}

	// async function verifyHandle() {
	// 	const handle = await getFileHandle();
	// 	if (handle) setIsHandle(true);
	// }

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		checkHandle();
	}, []);

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
				onClick={async () => {
					const masterPassword = passwordInputRef.current?.value;
					setPassword(masterPassword);

					// if (!hasStoredHandle) {
					// 	await saveNewFileHandle();
					// } else {
					// 	const cripted = await encryptVault(masterPassword, vault);
					// 	await saveNewFileHandle(cripted);
					// 	console.log("Encriptado:\n" + cripted);
					// }
				}}
			>
				Próximo
			</button>
			<button
				className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
				onClick={async () => {
					const content = await getFileHandle();
					setVault(content);
					await checkHandle();
				}}
				disabled={loading}
			>
				{!hasStoredHandle
					? "Selecionar Arquivo"
					: "Selecionar Arquivo Anterior"}
			</button>
			{!hasStoredHandle && (
				<button
					className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
					onClick={async () => {
						if (!password) {
							console.log("Senha não definida");
						} else {
							await saveNewFileHandle(password);
						}
						await checkHandle();
					}}
					disabled={loading}
				>
					Salvar Arquivo Inicial
				</button>
			)}
			{hasStoredHandle && (
				<button
					className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-200"
					onClick={async () => {
						const content = await getNewFile();
						setVault(content);
						await checkHandle();
					}}
					disabled={loading}
				>
					Selecionar Arquivo
				</button>
			)}
			<button
				className="px-4 py-2 rounded text-black disabled:opacity-50 bg-blue-500"
				onClick={async () => {}}
			>
				Concluir
			</button>
		</section>
	);
}
