import type { ThemeColor } from "@/types/models";

export interface ThemePalette {
  base: string;
  low: string;
  med: string;
  high: string;
}

export const THEME_PALETTES: Record<ThemeColor, ThemePalette> = {
  orange: {
    base: "#2a2a2a",
    low: "#ffb74d",
    med: "#ff9800",
    high: "#e65100",
  },
  red: {
    base: "#2a2a2a",
    low: "#ef9a9a",
    med: "#f44336",
    high: "#b71c1c",
  },
  blue: {
    base: "#2a2a2a",
    low: "#90caf9",
    med: "#2196f3",
    high: "#0d47a1",
  },
  purple: {
    base: "#2a2a2a",
    low: "#ce93d8",
    med: "#ab47bc",
    high: "#4a148c",
  },
};

export function getIntensityColor(
  intensity: number,
  themeColor: ThemeColor,
): string {
  const palette = THEME_PALETTES[themeColor];

  if (intensity <= 0.1) {
    return palette.base;
  }

  if (intensity <= 0.4) {
    return palette.low;
  }

  if (intensity <= 0.7) {
    return palette.med;
  }

  return palette.high;
}
