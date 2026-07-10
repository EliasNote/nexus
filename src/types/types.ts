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

export type GitSyncStatus =
  | "idle"
  | "checking"
  | "pulling"
  | "committing"
  | "pushing"
  | "success"
  | "error";

export type GitSyncResult = {
  ok: boolean;
  message: string;
  output?: string;
};

export type GitRepoStatus = {
  isGitRepo: boolean;
  hasRemote: boolean;
  hasChanges: boolean;
  branch?: string;
  remoteUrl?: string;
};

export interface GoogleToken {
  accessToken: string;
  expiresAt: number;
}

export interface GoogleAuthProvider {
  login: () => void;
  loginWithPromise: () => Promise<GoogleToken | null>;
  refresh: () => Promise<GoogleToken | null>;
  disconnect: () => void | Promise<void>;
}
