import { SITE } from "@/constants";

import type { SEOMetadata } from ".";

interface MarkdownFrontmatter {
  title?: string;
  description?: string;
  type?: SEOMetadata["type"];
  keywords?: string[];
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

interface MarkdownModule {
  frontmatter?: MarkdownFrontmatter;
}

export async function decorateMarkdownPageSEO(
  baseSEO: SEOMetadata,
  slug: string,
): Promise<SEOMetadata> {
  try {
    const markdownFiles = import.meta.glob<MarkdownModule>("/content/**/*.md");
    const possiblePaths = [`/content/${slug}.md`, `/content/markdownPages/${slug}.md`];

    for (const fullPath of possiblePaths) {
      const loadModule = markdownFiles[fullPath];
      if (!loadModule) {
        continue;
      }

      const { frontmatter } = await loadModule();
      if (!frontmatter) {
        continue;
      }

      const title = frontmatter.title ?? baseSEO.title;
      const fullTitle = SITE.title.template.replace("%s", title);

      return {
        ...baseSEO,
        title,
        fullTitle,
        description: frontmatter.description ?? `Learn more about ${title} at OKTech`,
        type: frontmatter.type ?? "article",
        keywords: frontmatter.keywords ?? [title, "OKTech"],
        ogImage: frontmatter.ogImage ?? baseSEO.ogImage,
        article: frontmatter.publishedTime
          ? {
              publishedTime: frontmatter.publishedTime,
              modifiedTime: frontmatter.modifiedTime,
              author: frontmatter.author,
              tags: frontmatter.tags,
            }
          : undefined,
      };
    }

    return {
      ...baseSEO,
      type: "article",
    };
  } catch (error) {
    console.error(`Error processing markdown page SEO for ${slug}:`, error);
    return baseSEO;
  }
}
