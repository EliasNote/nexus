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

  async function sha1(text: string) {
    const msgUint8 = new TextEncoder().encode(text); // Transforma a string em bytes
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8); // Gera o hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Converte para array de bytes
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // Transforma em string hexadecimal
    return hashHex.toUpperCase();
  }

  async function checkPassword() {
    // 1. Gera o hash SHA-1 da senha digitada
    const hashCompleto = await sha1("Elias123"); 

    // 2. Separa em Prefixo (5 chars) e Sufixo (o resto)
    const prefixo = hashCompleto.substring(0, 5).toUpperCase();
    const meuSufixo = hashCompleto.substring(5).toUpperCase();

    const URL = `https://api.pwnedpasswords.com/range/${prefixo}`;

    try {
      const response = await fetch(URL);
      const textoResposta = await response.text();

      // 3. Quebra a resposta em linhas
      const linhas = textoResposta.split('\n');

      // 4. Procura se ALGUMA linha começa com o MEU SUFIXO
      const linhaEncontrada = linhas.find(linha => {
          // A linha vem assim: "SUFIXO:CONTAGEM"
          const [sufixoDaApi, count] = linha.split(':');
          
          // Compara o sufixo da API com o seu sufixo local
          return sufixoDaApi === meuSufixo;
      });

      if (linhaEncontrada) {
        // Se achou, pega a contagem (que está depois do :)
        const count = linhaEncontrada.split(':')[1];
        console.log(`PERIGO! Essa senha vazou ${count} vezes.`);
      } else {
        console.log("Senha segura (não encontrada).");
      }

    } catch (error) {
      console.error('Erro:', error);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkHandle();
	checkPassword();    
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
