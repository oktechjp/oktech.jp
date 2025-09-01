import { useEffect, useState } from "react";

import {
  LuCheck,
  LuChevronDown,
  LuCopy,
  LuPalette,
  LuRotateCcw,
  LuSave,
  LuTrash2,
  LuX,
} from "react-icons/lu";

import { DAISYUI_THEME_VALUES } from "./daisyui-themes";

interface ThemeVariable {
  name: string;
  cssVar: string;
  type: "color" | "radius" | "size" | "number";
}

interface SavedTheme {
  name: string;
  variables: Record<string, string>;
  timestamp: number;
}

const THEME_VARIABLES: ThemeVariable[] = [
  { name: "Base 100", cssVar: "--color-base-100", type: "color" },
  { name: "Base 200", cssVar: "--color-base-200", type: "color" },
  { name: "Base 300", cssVar: "--color-base-300", type: "color" },
  { name: "Base Content", cssVar: "--color-base-content", type: "color" },
  { name: "Primary", cssVar: "--color-primary", type: "color" },
  { name: "Primary Content", cssVar: "--color-primary-content", type: "color" },
  { name: "Secondary", cssVar: "--color-secondary", type: "color" },
  { name: "Secondary Content", cssVar: "--color-secondary-content", type: "color" },
  { name: "Accent", cssVar: "--color-accent", type: "color" },
  { name: "Accent Content", cssVar: "--color-accent-content", type: "color" },
  { name: "Neutral", cssVar: "--color-neutral", type: "color" },
  { name: "Neutral Content", cssVar: "--color-neutral-content", type: "color" },
  { name: "Info", cssVar: "--color-info", type: "color" },
  { name: "Info Content", cssVar: "--color-info-content", type: "color" },
  { name: "Success", cssVar: "--color-success", type: "color" },
  { name: "Success Content", cssVar: "--color-success-content", type: "color" },
  { name: "Warning", cssVar: "--color-warning", type: "color" },
  { name: "Warning Content", cssVar: "--color-warning-content", type: "color" },
  { name: "Error", cssVar: "--color-error", type: "color" },
  { name: "Error Content", cssVar: "--color-error-content", type: "color" },
  { name: "Box Radius", cssVar: "--radius-box", type: "radius" },
  { name: "Field Radius", cssVar: "--radius-field", type: "radius" },
  { name: "Selector Radius", cssVar: "--radius-selector", type: "radius" },
];

const DAISYUI_THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

function oklchToHex(oklch: string): string {
  const match = oklch.match(/oklch\(([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)\)/);
  if (!match) return "#000000";

  let l: number;
  if (match[1].includes("%")) {
    l = parseFloat(match[1].replace("%", "")) / 100;
  } else {
    l = parseFloat(match[1]);
  }

  let c: number;
  if (match[2].includes("%")) {
    c = parseFloat(match[2].replace("%", "")) / 100;
  } else {
    c = parseFloat(match[2]);
  }

  const h = parseFloat(match[3]);

  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);

  let r = l + 0.3963377774 * a + 0.2158037573 * b;
  let g = l - 0.1055613458 * a - 0.0638541728 * b;
  let bl = l - 0.0894841775 * a - 1.291485548 * b;

  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bl = Math.max(0, Math.min(1, bl));

  const toHex = (val: number) =>
    Math.round(val * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function hexToOklch(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const lightness = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bVal = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  const chroma = Math.sqrt(a * a + bVal * bVal);
  let hue = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return `oklch(${(lightness * 100).toFixed(3)}% ${chroma.toFixed(3)} ${hue.toFixed(3)})`;
}

function getCurrentThemeValue(cssVar: string): string {
  const computed = getComputedStyle(document.documentElement);
  return computed.getPropertyValue(cssVar).trim() || "";
}

export default function ThemeEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [selectedThemeName, setSelectedThemeName] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [baseThemeValues, setBaseThemeValues] = useState<Record<string, string>>({});
  const [showCSSDialog, setShowCSSDialog] = useState(false);
  const [cssContent, setCssContent] = useState("");

  useEffect(() => {
    // Load saved themes
    const themes = localStorage.getItem("theme-editor-saved-themes");
    if (themes) {
      try {
        setSavedThemes(JSON.parse(themes));
      } catch (e) {
        console.error("Failed to load saved themes:", e);
      }
    }

    // Check for active theme from Theme Editor
    const activeThemeName = localStorage.getItem("theme-editor-active-theme");
    if (activeThemeName) {
      setSelectedThemeName(activeThemeName);
      if (activeThemeName.startsWith("DaisyUI:")) {
        const daisyTheme = activeThemeName.replace("DaisyUI: ", "");
        const themeValues = DAISYUI_THEME_VALUES[daisyTheme];
        if (themeValues) {
          setCustomValues({});
          setBaseThemeValues(themeValues);
          applyOverrides(themeValues);
        }
        document.documentElement.setAttribute("data-theme", daisyTheme);
        localStorage.setItem("theme", daisyTheme);
      } else {
        loadThemeByName(activeThemeName);
      }
    } else {
      // No theme selected in editor, check for overrides or use default dark theme
      const stored = localStorage.getItem("theme-editor-overrides");
      if (stored) {
        try {
          const overrides = JSON.parse(stored);
          console.log("overrides", overrides);
          setCustomValues(overrides);
          applyOverrides(overrides);
        } catch (e) {
          console.error("Failed to load theme overrides:", e);
        }
      }
    }

    captureBaseThemeValues();
  }, []);

  useEffect(() => {
    if (isOpen) {
      captureBaseThemeValues();
    }
  }, [isOpen, selectedThemeName]);

  const captureBaseThemeValues = () => {
    const values: Record<string, string> = {};
    THEME_VARIABLES.forEach((variable) => {
      const value = getCurrentThemeValue(variable.cssVar);
      if (value) {
        values[variable.cssVar] = value;
      }
    });
    setBaseThemeValues(values);
  };

  const applyOverrides = (overrides: Record<string, string>) => {
    Object.entries(overrides).forEach(([cssVar, value]) => {
      document.documentElement.style.setProperty(cssVar, value);
    });
  };

  const clearOverrides = () => {
    THEME_VARIABLES.forEach((variable) => {
      document.documentElement.style.removeProperty(variable.cssVar);
    });
  };

  const loadThemeByName = (name: string) => {
    const themes = localStorage.getItem("theme-editor-saved-themes");
    if (!themes) return;

    try {
      const savedThemes: SavedTheme[] = JSON.parse(themes);
      const theme = savedThemes.find((t) => t.name === name);
      if (theme) {
        setCustomValues(theme.variables);
        applyOverrides(theme.variables);
      }
    } catch (e) {
      console.error("Failed to load theme:", e);
    }
  };

  const handleValueChange = (cssVar: string, value: string, type: string) => {
    let finalValue = value;
    if (type === "color") {
      finalValue = hexToOklch(value);
    } else if (type === "radius") {
      finalValue = value.includes("rem") || value.includes("px") ? value : `${value}rem`;
    }

    const newValues = { ...customValues, [cssVar]: finalValue };
    setCustomValues(newValues);
    document.documentElement.style.setProperty(cssVar, finalValue);
    localStorage.setItem("theme-editor-overrides", JSON.stringify(newValues));
  };

  const resetToDefaults = () => {
    clearOverrides();
    setCustomValues({});
    setSelectedThemeName("");
    localStorage.removeItem("theme-editor-overrides");
    localStorage.removeItem("theme-editor-active-theme");

    // Reset to dark theme in dev mode
    const darkThemeValues = DAISYUI_THEME_VALUES["dark"];
    if (darkThemeValues) {
      setBaseThemeValues(darkThemeValues);
      applyOverrides(darkThemeValues);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  };

  const saveTheme = () => {
    if (!newThemeName.trim()) return;

    const currentValues: Record<string, string> = {};
    THEME_VARIABLES.forEach((variable) => {
      const value = customValues[variable.cssVar] || baseThemeValues[variable.cssVar];
      if (value) {
        currentValues[variable.cssVar] = value;
      }
    });

    const newTheme: SavedTheme = {
      name: newThemeName.trim(),
      variables: currentValues,
      timestamp: Date.now(),
    };

    const updatedThemes = [...savedThemes.filter((t) => t.name !== newThemeName.trim()), newTheme];
    setSavedThemes(updatedThemes);
    localStorage.setItem("theme-editor-saved-themes", JSON.stringify(updatedThemes));
    setSelectedThemeName(newThemeName.trim());
    localStorage.setItem("theme-editor-active-theme", newThemeName.trim());
    setShowSaveDialog(false);
    setNewThemeName("");
  };

  const loadTheme = (theme: SavedTheme) => {
    clearOverrides();
    setCustomValues(theme.variables);
    applyOverrides(theme.variables);
    setSelectedThemeName(theme.name);
    localStorage.setItem("theme-editor-active-theme", theme.name);
    localStorage.setItem("theme-editor-overrides", JSON.stringify(theme.variables));
    setShowThemeDropdown(false);
  };

  const deleteTheme = (themeName: string) => {
    const updatedThemes = savedThemes.filter((t) => t.name !== themeName);
    setSavedThemes(updatedThemes);
    localStorage.setItem("theme-editor-saved-themes", JSON.stringify(updatedThemes));
    if (selectedThemeName === themeName) {
      setSelectedThemeName("");
      localStorage.removeItem("theme-editor-active-theme");
      resetToDefaults();
    }
  };

  const loadDaisyUITheme = (themeName: string) => {
    clearOverrides();
    setCustomValues({});

    // Apply the actual theme values from our presets
    const themeValues = DAISYUI_THEME_VALUES[themeName];
    if (themeValues) {
      Object.entries(themeValues).forEach(([cssVar, value]) => {
        document.documentElement.style.setProperty(cssVar, value);
      });
      setBaseThemeValues(themeValues);
    }

    setSelectedThemeName(`DaisyUI: ${themeName}`);
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("theme", themeName);
    localStorage.removeItem("theme-editor-overrides");
    localStorage.setItem("theme-editor-active-theme", `DaisyUI: ${themeName}`);
    setShowThemeDropdown(false);
  };

  const openCSSDialog = () => {
    const currentValues: Record<string, string> = {};
    THEME_VARIABLES.forEach((variable) => {
      const value = customValues[variable.cssVar] || baseThemeValues[variable.cssVar];
      if (value) {
        currentValues[variable.cssVar] = value;
      }
    });

    // Generate simple CSS variables format
    const css = Object.entries(currentValues)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

    setCssContent(css);
    setShowCSSDialog(true);
  };

  const updateFromCSS = () => {
    try {
      // Parse the CSS content to extract theme values
      const lines = cssContent.split("\n");
      const themeValues: Record<string, string> = {};

      lines.forEach((line) => {
        // Extract CSS variables
        const varMatch = line.match(/^\s*(--[\w-]+):\s*([^;]+);?/);
        if (varMatch) {
          themeValues[varMatch[1]] = varMatch[2].trim();
        }
      });

      if (Object.keys(themeValues).length > 0) {
        // Apply the parsed theme values
        clearOverrides();
        setCustomValues(themeValues);
        setBaseThemeValues(themeValues);
        applyOverrides(themeValues);
        setSelectedThemeName("Custom CSS");
      }

      setShowCSSDialog(false);
      setCssContent("");
    } catch (error) {
      console.error("Failed to parse CSS:", error);
    }
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(cssContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInputValue = (variable: ThemeVariable) => {
    const value = customValues[variable.cssVar] || baseThemeValues[variable.cssVar] || "";

    if (variable.type === "color" && value) {
      return oklchToHex(value);
    } else if (variable.type === "radius") {
      return value.replace(/rem|px/, "");
    }
    return value;
  };

  const getTextValue = (variable: ThemeVariable) => {
    return customValues[variable.cssVar] || baseThemeValues[variable.cssVar] || "";
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-circle btn-primary fixed right-4 bottom-4 z-[9999] shadow-lg"
        aria-label="Open theme editor"
      >
        <LuPalette className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      <div className="bg-base-200 fixed inset-y-0 right-0 z-[9999] w-96 overflow-y-auto shadow-xl">
        <div className="bg-base-200 border-base-300 sticky top-0 z-10 flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Theme Editor</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close theme editor"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="btn btn-sm btn-block justify-between"
            >
              <span className="truncate">{selectedThemeName || "Select Theme"}</span>
              <LuChevronDown className="h-4 w-4" />
            </button>

            {showThemeDropdown && (
              <div className="bg-base-100 border-base-300 absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-lg">
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-semibold opacity-60">Saved Themes</div>
                  {savedThemes.length === 0 && (
                    <div className="px-2 py-1 text-sm opacity-50">No saved themes</div>
                  )}
                  {savedThemes.map((theme) => (
                    <div
                      key={theme.name}
                      className="hover:bg-base-200 flex items-center justify-between rounded px-2 py-1"
                    >
                      <button onClick={() => loadTheme(theme)} className="flex-1 text-left text-sm">
                        {theme.name}
                      </button>
                      <button
                        onClick={() => deleteTheme(theme.name)}
                        className="btn btn-ghost btn-xs"
                      >
                        <LuTrash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  <div className="divider my-1"></div>
                  <div className="px-2 py-1 text-xs font-semibold opacity-60">DaisyUI Themes</div>
                  {DAISYUI_THEMES.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => loadDaisyUITheme(theme)}
                      className="hover:bg-base-200 block w-full rounded px-2 py-1 text-left text-sm"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="btn btn-sm btn-ghost flex-1"
              disabled={Object.keys(customValues).length === 0}
            >
              <LuSave className="h-4 w-4" />
              Save
            </button>
            <button onClick={resetToDefaults} className="btn btn-sm btn-ghost flex-1">
              <LuRotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button onClick={openCSSDialog} className="btn btn-sm btn-ghost flex-1">
              <LuCopy className="h-4 w-4" />
              CSS
            </button>
          </div>

          <div className="divider">Colors</div>

          {THEME_VARIABLES.filter((v) => v.type === "color").map((variable) => (
            <div key={variable.cssVar} className="form-control">
              <label className="label">
                <span className="label-text text-xs">{variable.name}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getInputValue(variable)}
                  onChange={(e) =>
                    handleValueChange(variable.cssVar, e.target.value, variable.type)
                  }
                  className="h-10 w-12 cursor-pointer rounded"
                />
                <input
                  type="text"
                  value={getTextValue(variable)}
                  onChange={(e) => {
                    const newValues = { ...customValues, [variable.cssVar]: e.target.value };
                    setCustomValues(newValues);
                    document.documentElement.style.setProperty(variable.cssVar, e.target.value);
                    localStorage.setItem("theme-editor-overrides", JSON.stringify(newValues));
                  }}
                  className="input input-sm input-bordered flex-1 font-mono text-xs"
                />
              </div>
            </div>
          ))}

          <div className="divider">Radius</div>

          {THEME_VARIABLES.filter((v) => v.type === "radius").map((variable) => (
            <div key={variable.cssVar} className="form-control">
              <label className="label">
                <span className="label-text text-xs">{variable.name}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.25"
                  value={parseFloat(getInputValue(variable)) || 0}
                  onChange={(e) =>
                    handleValueChange(variable.cssVar, e.target.value, variable.type)
                  }
                  className="range range-xs flex-1"
                />
                <span className="w-16 text-xs">{getInputValue(variable)}rem</span>
              </div>
            </div>
          ))}

          <div className="alert alert-info text-xs">
            <span>
              {selectedThemeName
                ? `Active theme: ${selectedThemeName}`
                : "No theme selected. Customize the current theme."}
            </span>
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-lg p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">Save Theme</h3>
            <input
              type="text"
              placeholder="Enter theme name"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="input input-bordered mb-4 w-full"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && saveTheme()}
            />
            <div className="flex gap-2">
              <button onClick={saveTheme} className="btn btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setShowSaveDialog(false)} className="btn btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCSSDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-base-100 w-[600px] max-w-[90vw] rounded-lg p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Theme CSS Variables</h3>
              <button onClick={copyCSS} className="btn btn-sm btn-ghost" title="Copy to clipboard">
                {copied ? <LuCheck className="h-4 w-4" /> : <LuCopy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mb-2 text-sm opacity-70">
              Edit the CSS variables below and click Update to apply changes
            </p>
            <textarea
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              className="textarea textarea-bordered mb-4 h-96 w-full font-mono text-xs"
              placeholder="  --color-base-100: oklch(100% 0 0);"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={updateFromCSS} className="btn btn-primary flex-1">
                Update Theme
              </button>
              <button
                onClick={() => {
                  setShowCSSDialog(false);
                  setCssContent("");
                }}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
