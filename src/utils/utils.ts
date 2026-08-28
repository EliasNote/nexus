import { isTauri } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { REUSED_GROUP_COLORS } from "./constants";

export const getGithubUserData = async (token: string) => {
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await userRes.json();
};

export const getGithubUserRepo = async (token: string, user: string) => {
  const repoRes = await fetch(
    `https://api.github.com/repos/${user}/nexus-vault`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return repoRes;
};

export async function copyToClipboard(text: string): Promise<void> {
  if (isTauri()) {
    await writeText(text);
  } else {
    await navigator.clipboard.writeText(text);
  }
}

export function formatGitHubRemoteUrl(value: string): string {
  const input = value.trim();
  const match = input.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)(?:\/tree\/[^/?#]+)?\/?$/i);

  if (!match) {
    throw new Error("Informe um link valido de um repositorio do GitHub.");
  }

  const [, owner, repository] = match;
  const cleanRepository = repository.replace(/\.git$/i, "");

  return `https://github.com/${owner}/${cleanRepository}.git`;
}

export function getHeadings(content: string) {
  return content
    .replace(/^\uFEFF/, "")
    .split("\n")
    .filter((line) => /^#\s/.test(line))
    .map((line) => ({
      level: 1,
      text: line.replace(/^#{1,6}\s*/, "").trim(),
    }));
}


export const getReusedColorClass = (ids?: string[]) => {
  if (!ids?.length) return undefined;

  const groupKey = [...ids].sort().join(":");
  const colorIndex = [...groupKey].reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );

  return REUSED_GROUP_COLORS[colorIndex % REUSED_GROUP_COLORS.length];
};
