import { Clock, Database, Lock, Server, TriangleAlert } from "lucide-react";
import type { AuditType } from "./types";

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

export const CLOUD_OPTIONS = [
  // {
  //   id: "github",
  //   title: "GITHUB",
  //   subtitle: "Usar GitHub como cofre",
  //   icon: Server,
  // },
  {
    id: "google",
    title: "GOOGLE DRIVE",
    subtitle: "Usar cofre do Google Drive",
    icon: Server,
  },
];
