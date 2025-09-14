#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Parse theme colors from CSS file
function extractThemeColors() {
  const cssPath = join(process.cwd(), "src/styles/themes.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  const themes: Record<string, Record<string, string>> = {};

  // Parse each theme block
  const themeBlocks = cssContent.match(/@plugin "daisyui\/theme" \{[^}]+\}/g) || [];

  for (const block of themeBlocks) {
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    if (nameMatch) {
      const themeName = nameMatch[1];
      themes[themeName] = {};

      // Extract color variables
      const lines = block.split("\n");
      for (const line of lines) {
        const colorMatch = line.match(/^\s*--color-([^:]+):\s*([^;]+);/);
        if (colorMatch) {
          const colorName = colorMatch[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          themes[themeName][colorName] = colorMatch[2].trim();
        }
      }
    }
  }

  return themes;
}

// Convert oklch to approximate hex
function oklchToHex(oklchString: string): string {
  const match = oklchString.match(/oklch\(([\d.]+%?) ([\d.]+) ([\d.]+)\)/);
  if (!match) return "#000000";

  let l = parseFloat(match[1]);
  if (match[1].includes("%")) l = l / 100;
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);

  // Simplified conversion (approximate)
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab to linear RGB (simplified)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b_rgb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  // Gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b_rgb = b_rgb > 0.0031308 ? 1.055 * Math.pow(b_rgb, 1 / 2.4) - 0.055 : 12.92 * b_rgb;

  // Convert to hex
  const toHex = (val: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(val * 255)));
    return clamped.toString(16).padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b_rgb)}`;
}

// Generate TypeScript module
function generateModule() {
  const themes = extractThemeColors();

  const themeHex: Record<string, Record<string, string>> = {};
  for (const [themeName, colors] of Object.entries(themes)) {
    themeHex[themeName] = {};
    for (const [colorName, value] of Object.entries(colors)) {
      themeHex[themeName][colorName] = oklchToHex(value);
    }
  }

  const output = `// Auto-generated from src/styles/themes.css
// Run: npm run extract-themes

export const themeColorsHex = ${JSON.stringify(themeHex, null, 2)} as const;
`;

  const outputPath = join(process.cwd(), "src/utils/og/theme-colors.ts");
  writeFileSync(outputPath, output);
  console.log(`✅ Theme colors extracted to ${outputPath}`);
}

generateModule();
