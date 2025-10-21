import { SEO_DATA, SITE } from "@/constants";

import type { SEOMetadata } from "./index";

export function decorateStaticPageSEO(baseSEO: SEOMetadata, pathname: string): SEOMetadata {
  const staticSEO = SEO_DATA[pathname];
  if (!staticSEO) {
    return baseSEO;
  }

  const fullTitle =
    pathname === "/" ? SITE.title.default : SITE.title.template.replace("%s", staticSEO.title);

  return {
    ...baseSEO,
    title: staticSEO.title,
    fullTitle,
    description: staticSEO.description,
    type: "website",
    keywords: staticSEO.keywords,
  };
}
