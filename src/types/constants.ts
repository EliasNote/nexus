import { HardDrive, Server } from "lucide-react";
import type { StorageProvider } from "@/hooks/storage/types";

type CloudOption = {
  id: Exclude<StorageProvider, null>;
  title: string;
  subtitle: string;
  type: Array<"web" | "desktop">;
  icon: typeof HardDrive;
};

export const MONTH_OPTIONS = [
  "01 - Janeiro",
  "02 - Fevereiro",
  "03 - Março",
  "04 - Abril",
  "05 - Maio",
  "06 - Junho",
  "07 - Julho",
  "08 - Agosto",
  "09 - Setembro",
  "10 - Outubro",
  "11 - Novembro",
  "12 - Dezembro",
];

export const CLOUD_OPTIONS: CloudOption[] = [
  {
    id: "local",
    title: "ARMAZENAMENTO LOCAL",
    subtitle: "Salvar o cofre no dispositivo",
    type: ["desktop"],
    icon: HardDrive,
  },
  {
    id: "google",
    title: "GOOGLE DRIVE",
    subtitle: "Usar cofre do Google Drive",
    type: ["web"],
    icon: Server,
  },
];

export const REUSED_GROUP_COLORS = [
  "border-cyan-400/20 bg-cyan-900/10 text-cyan-200",
  "border-emerald-400/20 bg-emerald-900/10 text-emerald-200",
  "border-violet-400/20 bg-violet-900/10 text-violet-200",
  "border-rose-400/20 bg-rose-900/10 text-rose-200",
  "border-amber-400/20 bg-amber-900/10 text-amber-200",
  "border-sky-400/20 bg-sky-900/10 text-sky-200",
  "border-lime-400/20 bg-lime-900/10 text-lime-200",
  "border-teal-400/20 bg-teal-900/10 text-teal-200",
  "border-blue-400/20 bg-blue-900/10 text-blue-200",
  "border-indigo-400/20 bg-indigo-900/10 text-indigo-200",
  "border-fuchsia-400/20 bg-fuchsia-900/10 text-fuchsia-200",
  "border-pink-400/20 bg-pink-900/10 text-pink-200",
  "border-red-400/20 bg-red-900/10 text-red-200",
  "border-orange-400/20 bg-orange-900/10 text-orange-200",
  "border-yellow-400/20 bg-yellow-900/10 text-yellow-200",
  "border-green-400/20 bg-green-900/10 text-green-200",
  "border-purple-400/20 bg-purple-900/10 text-purple-200",
  "border-slate-400/20 bg-slate-900/10 text-slate-200",
];
