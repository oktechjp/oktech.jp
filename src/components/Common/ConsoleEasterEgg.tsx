import { useEffect } from "react";

import logoSvgRaw from "@/assets/OKTech-logo-auto.svg?raw";
import { DEV_MODE } from "@/constants";

const LOGO_STYLE_PARTS = [
  "background-size:contain",
  "padding:30px 140px",
  "margin-left:-14px",
  "display:inline-block",
] as const;

const BADGE_STYLE = [
  "font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue','Noto Sans','Liberation Sans',Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
  "font-weight:700",
  "font-size:20px",
  "letter-spacing:0.28em",
  "background:linear-gradient(90deg,#38bdf8,#a855f7,#f97316,#facc15,#4ade80)",
  "color:#f8fafc",
  "-webkit-text-fill-color:transparent",
  "-webkit-background-clip:text",
  "display:inline-block",
  "padding-top:5px",
].join(";");

function createLogoStyle(dataUri: string): string {
  return [`background:url("${dataUri}") no-repeat center`, ...LOGO_STYLE_PARTS].join(";");
}

function logBadge(): void {
  console.log("%cWelcome to the OKTech Magic Console 🪄", BADGE_STYLE);
}

export default function ConsoleEasterEgg(): null {
  useEffect(() => {
    if (DEV_MODE || typeof window === "undefined" || typeof window.btoa !== "function") {
      return;
    }

    const base64 = window.btoa(
      encodeURIComponent(logoSvgRaw).replace(/%([0-9A-F]{2})/g, (_, hex) =>
        String.fromCharCode(Number.parseInt(hex, 16)),
      ),
    );
    const logoDataUri = `data:image/svg+xml;base64,${base64}`;

    console.log("%c ", createLogoStyle(logoDataUri));
    logBadge();
  }, []);

  return null;
}
