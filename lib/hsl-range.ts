export function generateHslRange(
  startHex: string,
  endHex: string,
  steps: number,
): string[] {
  const start = rgbToHsl(hexToRgb(startHex));
  const end = rgbToHsl(hexToRgb(endHex));

  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    const h = interpolateHue(start.h, end.h, t);
    const s = start.s + (end.s - start.s) * t;
    const l = start.l + (end.l - start.l) * t;

    const rgb = hslToRgb({ h, s, l });
    colors.push(rgbToHex(rgb));
  }

  return colors;
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function interpolateHue(h1: number, h2: number, t: number): number {
  let delta = h2 - h1;

  if (Math.abs(delta) > 180) {
    delta -= Math.sign(delta) * 360;
  }

  return (h1 + delta * t + 360) % 360;
}

type HSL = { h: number; s: number; l: number };
type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const num = parseInt(hex.replace("#", ""), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h *= 60;
  }

  return { h, s, l };
}
