export const COLORS = {
  neon: {
    cyan: '#00d4ff',
    green: '#00ff88',
    orange: '#ff6b35',
    purple: '#a855f7',
  },
  background: {
    base: '#0a0e17',
    surface: '#111827',
    bright: '#1a1f2e',
    dim: '#0d1220',
  },
  medical: {
    50: 'rgba(0, 212, 255, 0.05)',
    100: 'rgba(0, 212, 255, 0.1)',
    200: 'rgba(0, 212, 255, 0.2)',
    300: 'rgba(0, 212, 255, 0.35)',
    400: '#00b8db',
    500: '#00d4ff',
    600: '#33ddff',
    700: '#66e6ff',
  },
  accent: {
    50: 'rgba(0, 255, 136, 0.05)',
    100: 'rgba(0, 255, 136, 0.1)',
    200: 'rgba(0, 255, 136, 0.2)',
    300: 'rgba(0, 255, 136, 0.35)',
    400: '#00cc6a',
    500: '#00ff88',
    600: '#33ff9f',
  },
  evidence: {
    strong: '#00ff88',
    moderate: '#ff6b35',
    emerging: '#a855f7',
    preclinical: '#64748b',
  },
  intensity: {
    1: 'rgba(0, 212, 255, 0.15)',
    2: 'rgba(0, 212, 255, 0.30)',
    3: 'rgba(0, 212, 255, 0.45)',
    4: 'rgba(0, 212, 255, 0.65)',
    5: 'rgba(0, 212, 255, 0.85)',
  },
} as const;

export const ANIMATION = {
  glow: {
    duration: 0.2,
    blur: 6,
  },
  sidebar: {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1],
  },
  pathway: {
    dotDuration: 3,
    maxConcurrent: 5,
    dotRadius: 4,
  },
  card: {
    stagger: 0.05,
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const BODY_SVG = {
  viewBox: '0 0 100 210',
  width: 100,
  height: 210,
} as const;

// Region label positions for tooltip display
export const REGION_LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
  brain: { x: 200, y: 55 },
  pituitary: { x: 200, y: 86 },
  heart: { x: 200, y: 200 },
  lungs: { x: 200, y: 210 },
  liver: { x: 220, y: 264 },
  gut: { x: 200, y: 330 },
  kidneys: { x: 200, y: 288 },
  muscles: { x: 200, y: 200 },
  joints: { x: 200, y: 160 },
  skin: { x: 200, y: 60 },
  bones: { x: 200, y: 420 },
  reproductive: { x: 200, y: 404 },
  'immune-system': { x: 200, y: 130 },
};

export const MAX_STACK_SIZE = 5;
export const MAX_COMPARE_SIZE = 4;
