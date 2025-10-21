import { useEffect } from "react";

import { renderToStaticMarkup } from "react-dom/server";

import { OKTechLogoIcon, colors } from "@/components/Common/OKTechLogo";
import { useFocus } from "@/hooks/useFocus";

export default function DynamicFavicon() {
  const isActive = useFocus();

  useEffect(() => {
    const updateFavicon = (active: boolean) => {
      // Get the base color based on the current theme
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const baseColor = isDark ? colors.BASE_DARK : colors.BASE_LIGHT;

      // Render the icon with unrotate when inactive
      let svgString = renderToStaticMarkup(
        OKTechLogoIcon({ active, noStyle: true, unrotate: !active }),
      );

      // Replace currentColor with the actual base color
      svgString = svgString.replace(/currentColor/g, baseColor);

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
        document.createElement("link");

      const oldUrl = link.href;
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = url;

      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(link);
      }

      if (oldUrl && oldUrl.startsWith("blob:")) {
        URL.revokeObjectURL(oldUrl);
      }
    };

    updateFavicon(isActive);
  }, [isActive]);

  return null;
}
