export interface ParsedURL {
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

class URLs {
  private static instance: URLs;
  private readonly basePath: string;
  private readonly origin: string;

  private constructor() {
    this.basePath = import.meta.env.BASE_URL || "/";
    const site = import.meta.env.SITE;

    if (!site) {
      console.warn("SITE env var not found, using fallback");
      const port = import.meta.env.DEV_PORT || "4321";
      this.origin = `http://localhost:${port}`.replace(/\/$/, "");
    } else {
      this.origin = site.replace(/\/$/, "");
    }
  }

  static getInstance(): URLs {
    if (!URLs.instance) {
      URLs.instance = new URLs();
    }
    return URLs.instance;
  }

  // Get site configuration
  getOrigin(): string {
    return this.origin;
  }

  getBasePath(): string {
    return this.basePath;
  }

  getBaseUrl(): string {
    return `${this.origin}${this.basePath}`;
  }

  // Path operations
  withBase(path: string): string {
    if (!path || path === "/") return this.basePath;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    if (this.basePath === "/") return cleanPath;

    return `${this.basePath}${cleanPath}`.replace(/\/+/g, "/");
  }

  withoutBase(path: string): string {
    if (this.basePath === "/" || !path.startsWith(this.basePath)) {
      return path;
    }

    let cleanPath = path.slice(this.basePath.length);
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  }

  normalize(path: string): string {
    return (
      path
        .replace(/\.html?$/, "") // Remove .html or .htm
        .replace(/\/$/, "") || "/"
    ); // Remove trailing slash except for root
  }

  // URL operations
  toAbsolute(path: string): string {
    const pathWithBase = this.withBase(path);
    return `${this.origin}${pathWithBase}`;
  }

  // Parsing operations
  parse(url: string): ParsedURL | null {
    try {
      const urlObj = new URL(url, "http://localhost");
      const pathname = this.withoutBase(urlObj.pathname);

      return {
        pathname: this.normalize(pathname),
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
      };
    } catch {
      // Treat as pathname if URL parsing fails
      const pathname = this.normalize(this.withoutBase(url));
      return { pathname, search: "", hash: "", origin: "" };
    }
  }
}

// Export singleton instance
export const urls = URLs.getInstance();
