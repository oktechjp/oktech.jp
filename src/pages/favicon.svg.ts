import type { APIRoute } from "astro";
import { renderToStaticMarkup } from "react-dom/server";

import { OKTechLogoIcon } from "@/components/Common/OKTechLogo";

export const GET: APIRoute = async () => {
  const svgString = renderToStaticMarkup(OKTechLogoIcon({ active: true }));

  return new Response(svgString, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
