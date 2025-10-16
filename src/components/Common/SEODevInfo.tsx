import { useEffect, useState } from "react";

import { LuInfo, LuX } from "react-icons/lu";

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  type: string;
  robots: string;
  keywords?: string[];
}

const STORAGE_KEY = "seo-dev-info-open";

export default function SEODevInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    const updateSEOData = () => {
      const metaTags = {
        title: document.title,
        description:
          document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
        ogImage:
          document.querySelector('meta[property="og:image"]')?.getAttribute("content") || undefined,
        type:
          document.querySelector('meta[property="og:type"]')?.getAttribute("content") || "website",
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
        keywords: document
          .querySelector('meta[name="keywords"]')
          ?.getAttribute("content")
          ?.split(",")
          .map((k) => k.trim()),
      };
      setSeoData(metaTags);
    };

    if (isOpen) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      updateSEOData();
      document.addEventListener("astro:page-load", updateSEOData);
    } else {
      sessionStorage.setItem(STORAGE_KEY, "false");
    }

    return () => {
      document.removeEventListener("astro:page-load", updateSEOData);
    };
  }, [isOpen]);

  return (
    <div className="fixed right-2 bottom-2 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-blue-500 px-3 py-2 font-mono text-sm text-white shadow-lg transition-all hover:bg-blue-600"
          aria-label="Open SEO info"
        >
          <LuInfo className="h-4 w-4" />
          SEO
        </button>
      ) : (
        <div className="bg-base-100 max-h-[80vh] w-[500px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base-content font-mono text-lg font-bold">SEO Information</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-base-content hover:bg-base-200 rounded-full p-1 transition-colors"
              aria-label="Close SEO info"
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>

          {seoData && (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-base-content/70 mb-1 font-bold">Title</div>
                <div className="bg-base-200 text-base-content rounded p-2">{seoData.title}</div>
              </div>

              <div>
                <div className="text-base-content/70 mb-1 font-bold">Description</div>
                <div className="bg-base-200 text-base-content rounded p-2">
                  {seoData.description}
                </div>
              </div>

              <div>
                <div className="text-base-content/70 mb-1 font-bold">Keywords</div>
                <div
                  className={`rounded p-2 ${
                    seoData.keywords && seoData.keywords.length > 0
                      ? "bg-base-200 text-base-content"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {seoData.keywords && seoData.keywords.length > 0
                    ? seoData.keywords.join(", ")
                    : "[empty]"}
                </div>
              </div>

              {seoData.ogImage && (
                <div>
                  <div className="text-base-content/70 mb-1 font-bold">OG Image</div>
                  <div className="border-base-300 mt-2 overflow-hidden rounded border">
                    <img
                      src={seoData.ogImage}
                      alt="OG Preview"
                      className="h-auto w-full"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="text-base-content/70 mb-1 font-bold">Meta Tags Preview</div>
                <details className="bg-base-200 rounded">
                  <summary className="text-base-content hover:bg-base-300 cursor-pointer p-2 text-sm">
                    View all meta tags
                  </summary>
                  <div className="border-base-300 max-h-[300px] space-y-1 overflow-y-auto border-t p-2">
                    <MetaTagDisplay name="title" content={seoData.title} />
                    <MetaTagDisplay name="description" content={seoData.description} />
                    <MetaTagDisplay property="og:title" content={seoData.title} />
                    <MetaTagDisplay property="og:description" content={seoData.description} />
                    <MetaTagDisplay property="og:url" content={seoData.canonical} />
                    <MetaTagDisplay property="og:type" content={seoData.type} />
                    {seoData.ogImage && (
                      <>
                        <MetaTagDisplay property="og:image" content={seoData.ogImage} />
                        <MetaTagDisplay property="og:image:width" content="1200" />
                        <MetaTagDisplay property="og:image:height" content="630" />
                      </>
                    )}
                    <MetaTagDisplay
                      name="twitter:card"
                      content={seoData.ogImage ? "summary_large_image" : "summary"}
                    />
                    <MetaTagDisplay name="twitter:title" content={seoData.title} />
                    <MetaTagDisplay name="twitter:description" content={seoData.description} />
                    {seoData.ogImage && (
                      <MetaTagDisplay name="twitter:image" content={seoData.ogImage} />
                    )}
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetaTagDisplay({
  name,
  property,
  content,
}: {
  name?: string;
  property?: string;
  content: string;
}) {
  const attr = name ? `name="${name}"` : `property="${property}"`;
  return (
    <div className="bg-base-300 text-base-content rounded p-1 text-[10px] break-all">
      &lt;meta {attr} content="{content}" /&gt;
    </div>
  );
}
