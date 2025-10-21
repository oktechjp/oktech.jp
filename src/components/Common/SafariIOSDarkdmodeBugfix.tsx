/**
 * Safari (WebKit bug 199134) ignores prefers-color-scheme rules when an SVG is embedded via <img>.
 * That breaks our multi-theme logos specifically on iOS Safari. Instead of duplicating assets,
 * we ship the normal SVG for most browsers and fall back to an inline React version with JS-managed
 * CSS variables only on iOS Safari. Research references:
 *  - https://bugs.webkit.org/show_bug.cgi?id=199134
 *  - https://mediaformat.org/2025/03/light-dark-limitations/
 */
import {
  type ComponentType,
  type ImgHTMLAttributes,
  type SVGProps,
  useEffect,
  useState,
} from "react";

type VariableDefinition = {
  name: string;
  light: string;
  dark: string;
};

type SafariIOSDarkdmodeBugfixProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  imgSrc: string;
  Svg: ComponentType<SVGProps<SVGSVGElement>>;
  variables: VariableDefinition[];
};

function isSafari(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  // Match Safari but exclude Chrome-based browsers (Chrome, Edge, Opera, Brave, etc.)
  // Safari has "Safari" in UA but Chrome/Edge also include "Safari" + their own identifier
  const hasSafari = /Safari/i.test(ua);
  const isNotChromeBased = !/Chrome|CriOS|Chromium|Edg|EdgiOS|OPR|Brave/i.test(ua);
  const isNotFirefox = !/Firefox|FxiOS/i.test(ua);

  return hasSafari && isNotChromeBased && isNotFirefox;
}

export default function SafariIOSDarkdmodeBugfix({
  imgSrc,
  Svg,
  variables,
  className,
  style,
  alt,
  role,
  "aria-hidden": ariaHidden,
  ...imgProps
}: SafariIOSDarkdmodeBugfixProps) {
  // Track if component has mounted to avoid hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Only run after mount to avoid hydration issues
    setHasMounted(true);

    const shouldPatch = isSafari();

    if (!shouldPatch) {
      return;
    }

    const updateTheme = () => {
      // Check data-theme attribute first (set by ThemeToggle)
      const dataTheme = document.documentElement.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") {
        setIsDark(dataTheme === "dark");
      } else if (typeof window.matchMedia === "function") {
        // Fall back to OS preference if no explicit theme set
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };

    // Initialize state immediately
    updateTheme();

    // Watch for theme changes via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Also listen to media query changes as fallback
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  // Before mount or if patch not needed, render the img tag (matches SSR)
  const shouldUsePatch = hasMounted && isSafari();

  // Common container props for consistent sizing
  const containerProps = {
    className,
    style,
    role: role ?? (alt ? "img" : undefined),
    "aria-hidden": ariaHidden,
  };

  if (!shouldUsePatch) {
    return <img {...containerProps} src={imgSrc} alt={alt} {...imgProps} />;
  }

  // After mount, if patch is needed, render the inline SVG with managed variables
  const variableStyle = variables.reduce<Record<string, string>>((acc, { name, light, dark }) => {
    acc[name] = isDark ? dark : light;
    return acc;
  }, {});

  const svgStyle = {
    ...containerProps.style,
    ...variableStyle,
  } as SVGProps<SVGSVGElement>["style"];

  return <Svg {...containerProps} width="100%" height="100%" style={svgStyle} aria-label={alt} />;
}
