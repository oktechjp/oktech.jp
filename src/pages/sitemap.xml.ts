import { generateSitemapURLs } from "../utils/sitemap";

export async function GET() {
  const urls = await generateSitemapURLs();

  // Compose the XML document
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`) // one entry per URL
    .join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
