import { Globe, CreditCard, FileText, type LucideIcon } from "lucide-react";
import { CREDENTIAL_TYPES, type CredentialType } from "@/types/vault";

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
