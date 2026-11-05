import { GitFork, HardDrive, Server, Globe, CreditCard, FileText, type LucideIcon } from "lucide-react";
import { CREDENTIAL_TYPES, type CredentialType } from "@/utils/vault";
import type { CloudOption } from "@/utils/types";

export interface CredentialMenuOption {
  type: CredentialType;
  icon: LucideIcon;
  label: string;
}

export const LOGIN_TYPE: CredentialMenuOption = {
  type: CREDENTIAL_TYPES.LOGIN,
  icon: Globe,
  label: "LOGIN",
};

export const CARD_TYPE: CredentialMenuOption = {
  type: CREDENTIAL_TYPES.CARD,
  icon: CreditCard,
  label: "CARTÃO",
};

export const NOTE_TYPE: CredentialMenuOption = {
  type: CREDENTIAL_TYPES.NOTE,
  icon: FileText,
  label: "ANOTAÇÃO",
};

export const CrendetialTypes = {
  login: LOGIN_TYPE,
  card: CARD_TYPE,
  note: NOTE_TYPE,
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
    id: "git",
    title: "GIT",
    subtitle: "Usar cofre do Git",
    type: ["desktop"],
    icon: GitFork,
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
  "border-cyan-400/20 bg-cyan-900/10 text-cyan-200 [[data-theme=light]_&]:text-cyan-900",
  "border-emerald-400/20 bg-emerald-900/10 text-emerald-200 [[data-theme=light]_&]:text-emerald-900",
  "border-violet-400/20 bg-violet-900/10 text-violet-200 [[data-theme=light]_&]:text-violet-900",
  "border-rose-400/20 bg-rose-900/10 text-rose-200 [[data-theme=light]_&]:text-rose-900",
  "border-amber-400/20 bg-amber-900/10 text-amber-200 [[data-theme=light]_&]:text-amber-900",
  "border-sky-400/20 bg-sky-900/10 text-sky-200 [[data-theme=light]_&]:text-sky-900",
  "border-lime-400/20 bg-lime-900/10 text-lime-200 [[data-theme=light]_&]:text-lime-900",
  "border-teal-400/20 bg-teal-900/10 text-teal-200 [[data-theme=light]_&]:text-teal-900",
  "border-blue-400/20 bg-blue-900/10 text-blue-200 [[data-theme=light]_&]:text-blue-900",
  "border-indigo-400/20 bg-indigo-900/10 text-indigo-200 [[data-theme=light]_&]:text-indigo-900",
  "border-fuchsia-400/20 bg-fuchsia-900/10 text-fuchsia-200 [[data-theme=light]_&]:text-fuchsia-900",
  "border-pink-400/20 bg-pink-900/10 text-pink-200 [[data-theme=light]_&]:text-pink-900",
  "border-red-400/20 bg-red-900/10 text-red-200 [[data-theme=light]_&]:text-red-900",
  "border-orange-400/20 bg-orange-900/10 text-orange-200 [[data-theme=light]_&]:text-orange-900",
  "border-yellow-400/20 bg-yellow-900/10 text-yellow-200 [[data-theme=light]_&]:text-yellow-900",
  "border-green-400/20 bg-green-900/10 text-green-200 [[data-theme=light]_&]:text-green-900",
  "border-purple-400/20 bg-purple-900/10 text-purple-200 [[data-theme=light]_&]:text-purple-900",
  "border-slate-400/20 bg-slate-900/10 text-slate-200 [[data-theme=light]_&]:text-slate-900",
];


export const AUTO_SAVE_INTERVAL_OPTIONS = [
  {
    value: 30000,
    title: "30 segundos",
  },
  {
    value: 60000,
    title: "1 minuto",
  },
  {
    value: 300000,
    title: "5 minutos",
  },
  {
    value: 600000,
    title: "10 minutos",
  }
];
