import {
  LayoutGrid,
  Star,
  Trash2,
  Binary,
  Shield,
  Cloud,
  LogOut,
} from "lucide-react";

export const defaults = (iconsSize: number) => [
  {
    title: "TODOS OS ITENS",
    icon: <LayoutGrid size={iconsSize} />,
  },
  {
    title: "FAVORITOS",
    icon: <Star size={iconsSize} />,
  },
  {
    title: "LIXEIRA",
    icon: <Trash2 size={iconsSize} />,
  },
];

export const tools = (iconsSize: number) => [
  {
    title: "GERADOR",
    icon: <Binary size={iconsSize} />,
  },
  {
    title: "AUDITORIA",
    icon: <Shield size={iconsSize} />,
  },
];

export const footers = (iconsSize: number) => [
  {
    title: "SINCRONIZAR",
    icon: <Cloud size={iconsSize} />,
  },
  {
    title: "SAIR",
    icon: <LogOut size={iconsSize} />,
  },
];

export const getAllButtons = (iconsSize: number) => ({
  defaults: defaults(iconsSize),
  tools: tools(iconsSize),
  footers: footers(iconsSize),
});
