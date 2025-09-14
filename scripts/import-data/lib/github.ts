import { config } from "./config";
import { logger } from "./logger";

/**
 * GitHub service for fetching data and managing repository interactions
 */
export class GitHubService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      "User-Agent": "oktech-web-import-script",
    };

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
  async fetchRawContent(commitHash: string, filePath: string): Promise<string> {
    const url = config.github.getRawUrl(commitHash, filePath);
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch raw content: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Download a binary file from GitHub
   */
  async downloadFile(url: string): Promise<Buffer> {
    const fullUrl = url.startsWith("http") ? url : `${config.github.getRawBaseUrl()}${url}`;

    const response = await this.fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
