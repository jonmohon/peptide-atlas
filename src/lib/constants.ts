export const COLORS = {
  medical: {
    50: '#f0f7ff',
    100: '#e0effe',
    200: '#b9dffc',
    300: '#7cc5fa',
    400: '#36a9f5',
    500: '#0066cc',
    600: '#0052a3',
    700: '#003d7a',
  },
  accent: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#00cc88',
    500: '#00b377',
    600: '#009963',
  },
  evidence: {
    strong: '#22c55e',
    moderate: '#f59e0b',
    emerging: '#8b5cf6',
    preclinical: '#94a3b8',
  },
  intensity: {
    1: 'rgba(0, 102, 204, 0.15)',
    2: 'rgba(0, 102, 204, 0.30)',
    3: 'rgba(0, 102, 204, 0.45)',
    4: 'rgba(0, 102, 204, 0.65)',
    5: 'rgba(0, 102, 204, 0.85)',
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
  viewBox: '0 0 400 800',
  width: 400,
  height: 800,
} as const;

export const MAX_STACK_SIZE = 5;
export const MAX_COMPARE_SIZE = 4;
