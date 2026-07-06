import type { LucideIcon } from "lucide-react";

export type iconsInputProp = {
  id: string;
  icon: LucideIcon;
};

export type AuditType = {
  id: string;
  name: string;
  phrase: string;
  icon: LucideIcon;
  total: number;
};
