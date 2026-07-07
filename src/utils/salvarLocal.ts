// import { save } from "@tauri-apps/plugin-dialog";

// export async function salvarJsonComTauri(objeto: object, nomeArquivo: string) {
//   try {
//     // Abre diálogo para o usuário escolher onde salvar
//     const filePath = await save({
//       defaultPath: nomeArquivo,
//       filters: [
//         {
//           name: "JSON",
//           extensions: ["json"],
//         },
//       ],
//     });

//     if (filePath) {
//       // Salva o arquivo
//       await writeTextFile(filePath, JSON.stringify(objeto, null, 2));
//     }
//   } catch (err) {
//     console.error("Erro ao salvar:", err);
//   }
// }

// // Usar: onClick={() => salvarJsonComTauri({ dados }, 'arquivo.json')}
