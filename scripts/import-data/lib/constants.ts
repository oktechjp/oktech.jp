import path from "node:path";

export const GITHUB_REPO = "oktechjp/public";
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

export function getGithubRawUrl(commitHash: string, file: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_REPO}/${commitHash}/${file}`;
}

// Temporary - will be replaced with commit-specific URL
export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/main/`;
export const CONTENT_DIR = path.join("content");
export const EVENTS_BASE_DIR = path.join(CONTENT_DIR, "events");
export const VENUES_BASE_DIR = path.join(CONTENT_DIR, "venues");

// Toggle: If true, photos without an explicit event id will be matched by timestamp to the most
// recent past event. If false, such photo batches are ignored.
export const INFER_EVENTS = false;
