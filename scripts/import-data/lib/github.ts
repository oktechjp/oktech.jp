import { config } from "./config";
import { logger } from "./logger";

/**
 * GitHub service for fetching data and managing repository interactions
 */
export class GitHubService {
  private headers: Record<string, string>;
  private repo: string;
  private ref: string;

  constructor(options: { repo?: string; ref?: string } = {}) {
    this.headers = {
      "User-Agent": "oktech-web-import-script",
    };
    this.repo = options.repo ?? config.github.repo;
    this.ref = options.ref ?? config.github.defaultRef;

    // Use GitHub token if available
    if (config.github.token) {
      this.headers.Authorization = `token ${config.github.token}`;
    }
  }

  /**
   * Fetch from GitHub with automatic authentication
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    if (!response.ok && response.status === 403) {
      const remaining = response.headers.get("X-RateLimit-Remaining");
      if (remaining === "0") {
        const reset = response.headers.get("X-RateLimit-Reset");
        const resetDate = reset ? new Date(parseInt(reset) * 1000) : new Date();
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}`);
      }
    }

    return response;
  }

  configure(options: { repo?: string; ref?: string }): void {
    if (options.repo) {
      this.repo = options.repo;
    }
    if (options.ref) {
      this.ref = options.ref;
    }
  }

  getRawBaseUrl(): string {
    return config.github.getRawBaseUrl(this.ref, this.repo);
  }

  getRawFileUrl(relativePath: string): string {
    const normalizedPath = relativePath.replace(/^\/+/, "");
    return `${this.getRawBaseUrl()}${normalizedPath}`;
  }

  /**
   * Fetch JSON data from GitHub
   */
  async fetchJSON<T = unknown>(url: string): Promise<T> {
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(
        `GitHub request failed: ${response.status} ${response.statusText} for ${url}`,
      );
    }

    return response.json();
  }

  /**
   * Get the latest commit information for the main branch
   */
  async getLatestCommit(customRepo?: string): Promise<{ sha: string; date: string }> {
    try {
      const repo = customRepo || config.github.repo;
      const url = `https://api.github.com/repos/${repo}/commits/main`;
      const data = await this.fetchJSON<any>(url);
      this.repo = repo;

      return {
        sha: data.sha,
        date: data.commit.committer.date,
      };
    } catch (err) {
      logger.error("Failed to fetch latest commit info:", err);
      throw err;
    }
  }

  /**
   * Fetch raw file content from GitHub
   */
  async fetchRawContent(ref: string, filePath: string, repo = this.repo): Promise<string> {
    const baseUrl = config.github.getRawUrl(ref, filePath, repo);
    const response = await this.fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch raw content: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Download a binary file from GitHub
   */
  async downloadFile(pathOrUrl: string): Promise<Buffer> {
    const fullUrl = pathOrUrl.startsWith("http") ? pathOrUrl : this.getRawFileUrl(pathOrUrl);
    const response = await this.fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
