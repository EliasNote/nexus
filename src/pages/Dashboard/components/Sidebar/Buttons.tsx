import {
  LayoutGrid,
  Star,
  Trash2,
  Binary,
  Shield,
  CloudCheck,
  CloudOff,
  CloudUpload,
  LogOut,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

export const SIDEBAR_BUTTONS_IDS = {
  all: "all",
  favorites: "favorites",
  trash: "trash",
  generator: "generator",
  audit: "audit",
  config: "config",
};

export const defaults = (iconsSize: number) => [
  {
    id: SIDEBAR_BUTTONS_IDS.all,
    title: "TODOS OS ITENS",
    icon: <LayoutGrid size={iconsSize} />,
  },
  {
    id: SIDEBAR_BUTTONS_IDS.favorites,
    title: "FAVORITOS",
    icon: <Star size={iconsSize} />,
  },
  {
    id: SIDEBAR_BUTTONS_IDS.trash,
    title: "LIXEIRA",
    icon: <Trash2 size={iconsSize} />,
  }
];

export const tools = (iconsSize: number) => [
  {
    id: SIDEBAR_BUTTONS_IDS.generator,
    title: "GERADOR",
    icon: <Binary size={iconsSize} />,
  },
  {
    id: SIDEBAR_BUTTONS_IDS.audit,
    title: "AUDITORIA",
    icon: <Shield size={iconsSize} />,
  },
];

const cloudIcons = (iconsSize: number) => ({
  synced: <CloudCheck size={iconsSize} />,
  unsynced: (
    <motion.div
      animate={{ x: [0, -2, 2, -2, 0] }}
      transition={{
        repeat: Infinity,
        repeatDelay: 4,
        duration: 0.4,
      }}
    >
      <CloudOff size={iconsSize} />
    </motion.div>
  ),
  isSaving: (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <CloudUpload size={iconsSize} />
    </motion.div>
  ),
});

export const footers = (
  iconsSize: number,
  isPendingSync: boolean,
  isSaving: boolean,
) => [
  {
    id: "sync",
    title: "SINCRONIZAR",
    icon: cloudIcons(iconsSize)[
      isSaving ? "isSaving" : isPendingSync ? "unsynced" : "synced"
    ],
  },
  {
    id: "config",
    title: "CONFIGURAÇÕES",
    icon: <Settings size={iconsSize} />,
  },
  {
    id: "logout",
    title: "SAIR",
    icon: <LogOut size={iconsSize} />,
  },
];

export const getAllButtons = (
  iconsSize: number,
  isPendingSync: boolean,
  isSaving: boolean,
) => ({
  defaults: defaults(iconsSize),
  tools: tools(iconsSize),
  footers: footers(iconsSize, isPendingSync, isSaving),
});
