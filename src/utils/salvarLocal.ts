import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

declare global {
  interface Window {
    showSaveFilePicker?: any;
  }
}

export async function salvarJsonComoArquivo(
  objeto: object,
  nomeArquivo: string,
) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: nomeArquivo,
      types: [
        { description: "JSON", accept: { "application/json": [".json"] } },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(objeto, null, 2));
    await writable.close();
    return;
  } catch (error) {
    console.error("Erro ao salvar o arquivo:", error);
  }

  const json = JSON.stringify(objeto, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function salvarJsonComTauri(objeto: object, nomeArquivo: string) {
  try {
    // Abre diálogo para o usuário escolher onde salvar
    const filePath = await save({
      defaultPath: nomeArquivo,
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (filePath) {
      // Salva o arquivo
      await writeTextFile(filePath, JSON.stringify(objeto, null, 2));
    }
  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
}

// Usar: onClick={() => salvarJsonComTauri({ dados }, 'arquivo.json')}
