/** Returns true if the theme name indicates a dark theme (contains "dark"). */
export function isDarkTheme(themeName: string): boolean {
  if (!themeName || typeof themeName !== 'string') return false;
  return themeName.toLowerCase().includes('dark');
}

/**
 * Returns true if the given color string (hex or rgb/rgba) has a luminance
 * below 128 (i.e. is dark).
 */
export function isDarkColor(color: string): boolean {
  if (!color) return false;
  const c = color.trim();
  let r = 0, g = 0, b = 0;

  if (c.startsWith('#')) {
    const hex = c.substring(1);
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (c.startsWith('rgb')) {
    const match = c.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      r = Math.min(255, Math.max(0, parseFloat(match[0])));
      g = Math.min(255, Math.max(0, parseFloat(match[1])));
      b = Math.min(255, Math.max(0, parseFloat(match[2])));
    }
  } else {
    return false;
  }

  // YIQ luminance formula
  return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
}
