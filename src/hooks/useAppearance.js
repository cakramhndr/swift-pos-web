import { useState, useEffect, useCallback } from "react";

const DEFAULT_ACCENT = "#7c3aed";

/**
 * Convert hex color to its light background variant.
 * Uses a very light tint.
 */
function tintHex(hex, amount = 0.88) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenHex(hex, amount = 0.1) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function useAppearance() {
  const [accentColor, setAccentColorState] = useState(() => {
    try {
      const saved = localStorage.getItem("swiftpos_appearance");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.accentColor || DEFAULT_ACCENT;
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCENT;
  });

  // Apply CSS custom properties to document root
  const applyAccentColor = useCallback((color) => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", color);
    root.style.setProperty("--color-accent-hover", darkenHex(color, 0.12));
    root.style.setProperty("--color-accent-dark", darkenHex(color, 0.25));
    root.style.setProperty("--color-accent-light", tintHex(color, 0.88));
    root.style.setProperty("--color-accent-ring", color);
    root.style.setProperty("--color-accent-foreground", "#ffffff");
  }, []);

  // Setter that updates state, localStorage, and CSS variables
  const setAccentColor = useCallback(
    (color) => {
      setAccentColorState(color);
      applyAccentColor(color);

      // Also update the appearance object in localStorage so Settings page stays in sync
      try {
        const saved = localStorage.getItem("swiftpos_appearance");
        const appearance = saved ? JSON.parse(saved) : {};
        appearance.accentColor = color;
        localStorage.setItem("swiftpos_appearance", JSON.stringify(appearance));
      } catch {
        // ignore
      }
    },
    [applyAccentColor],
  );

  // Apply on mount and whenever accentColor changes
  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor, applyAccentColor]);

  return { accentColor, setAccentColor };
}
