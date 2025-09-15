# OKTech Web

> **Work in Progress**

The website for Osaka Tech community events and meetups.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Run tests
npx playwright install-deps
npx palywright install chrome --with-deps
npm run test
```

## Font Management

When updating fonts in the project, ensure changes are made in the following locations:

1. **Install font packages** - Update `package.json` dependencies:

   ```bash
   # Main site fonts (variable fonts)
   npm install @fontsource-variable/noto-sans-jp @fontsource/lexend @fontsource-variable/martian-mono

   # OG image fonts (requires WOFF format)
   npm install @fontsource/noto-sans-jp
   ```

2. **Main site font imports** - `/src/layouts/RootLayout.astro`:

   ```typescript
   import "@fontsource/lexend/700.css";

   import "@fontsource-variable/martian-mono";
   import "@fontsource-variable/noto-sans-jp";
   ```

3. **CSS font variables** - `/src/styles/fonts.css`:

   ```css
   --font-body: "Noto Sans JP Variable", Arial, sans-serif;
   --font-header: "Lexend", "Helvetica Neue", Helvetica, sans-serif;
   --font-mono: "Martian Mono Variable", "Courier New", monospace;
   ```

4. **OG image font loading** - `/src/utils/og/ogHandler.ts`:
   - OG images require WOFF format (not WOFF2) due to Satori limitations
   - Uses regular `@fontsource/noto-sans-jp` package for WOFF files
   - Font names must match: "Noto Sans JP" for consistency
   - Update both 400 and 700 weight paths when changing fonts

## Data Import

For importing event and venue data from external sources, see the [Import Script README](./scripts/import-data/README.md).

## Artificial Intelligence (AI) and Large Language Model (LLM) Disclosure

This project was created with the assistance of AI development tools including Cursor IDE and Claude Code, utilizing various LLMs such as Claude, Gemini, GPT, and others.

It can be assumed that multiple AI models have been used throughout the development of this project since its start in April 2025.

Thank you to all who made it possible.
