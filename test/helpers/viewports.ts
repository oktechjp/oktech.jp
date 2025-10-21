export const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "widescreen", width: 1920, height: 1080 },
] as const;

export type ViewportName = (typeof VIEWPORTS)[number]["name"];
export type Viewport = (typeof VIEWPORTS)[number];
