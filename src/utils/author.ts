export interface ParsedAuthor {
  name: string;
  github?: string;
  avatarUrl?: string;
  profileUrl?: string;
}

/**
 * Parses author string in "Full Name <github_handle>" format.
 * If no angle brackets, treats entire string as name.
 */
export function parseAuthor(author: string): ParsedAuthor {
  const match = author.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    const name = match[1].trim();
    const github = match[2].trim();
    return {
      name,
      github,
      avatarUrl: `https://github.com/${github}.png?size=80`,
      profileUrl: `https://github.com/${github}`,
    };
  }
  return { name: author.trim() };
}
