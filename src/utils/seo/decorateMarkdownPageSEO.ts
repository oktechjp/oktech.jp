import { getCollection } from "astro:content";

import { SITE } from "@/constants";
import { normalizeMarkdownSlug } from "@/content/markdownPages";

import type { SEOMetadata } from ".";

interface MarkdownFrontmatter {
  title?: string;
  description?: string;
  type?: SEOMetadata["type"];
  keywords?: string[];
  ogImage?: string;
}

interface MarkdownModule {
  frontmatter?: MarkdownFrontmatter;
}

const markdownFiles = import.meta.glob<MarkdownModule>("/content/**/*.md");

export async function decorateMarkdownPageSEO(
  baseSEO: SEOMetadata,
  slug: string,
): Promise<SEOMetadata> {
  const baseArticleSEO: SEOMetadata = { ...baseSEO, type: "article" };
  try {
    const normalizedSlug = normalizeMarkdownSlug(slug);
    const markdownPages = await getCollection("markdownPages");
    const entry = markdownPages.find((page) => page.id === normalizedSlug);
    if (!entry) return baseArticleSEO;

    const fullPath = `/content/${entry.data.filePath}`;
    const loadModule = markdownFiles[fullPath];
    if (!loadModule) return baseArticleSEO;

    const { frontmatter } = await loadModule();
    if (!frontmatter) return baseArticleSEO;

    const title = frontmatter.title ?? baseSEO.title;
    const fullTitle = SITE.title.template.replace("%s", title);

    // TODO we might want to add article specific metadata, such as publishedTime, modifiedTime, author, etc.

    return {
      ...baseArticleSEO,
      title,
      fullTitle,
      description: frontmatter.description ?? `Learn more about ${title} at OKTech`,
      type: frontmatter.type ?? baseArticleSEO.type,
      keywords: frontmatter.keywords ?? [title, "OKTech"],
      ogImage: frontmatter.ogImage ?? baseSEO.ogImage,
    };
  } catch (error) {
    console.error(`Error processing markdown page SEO for ${slug}:`, error);
    return baseArticleSEO;
  }
}
