# Design System

PeptideAtlas uses a dark-only theme with neon accent colors, glass-morphism panels, glow effects, and smooth animations. The visual language is clinical-futuristic: dark backgrounds with cyan, green, and orange neon highlights.

## Color Palette

All colors are defined as CSS custom properties in `src/app/globals.css` and as constants in `src/lib/constants.ts`.

### Background Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0a0e17` | Page background, deepest layer |
| `--surface` | `#111827` | Card backgrounds, panels |
| `--surface-bright` | `#1a1f2e` | Elevated panels (sidebar, chat widget) |
| `--surface-dim` | `#0d1220` | Recessed elements, code blocks |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--foreground` | `#e2e8f0` | Primary text |
| `--text-secondary` | `#64748b` | Secondary labels, descriptions |
| `--text-muted` | `#475569` | Placeholder text, subtle labels |

### Neon Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--neon-cyan` | `#00d4ff` | Primary accent: buttons, links, active states, borders, medical theme |
| `--neon-green` | `#00ff88` | Success states, selected regions, strong evidence, accent theme |
| `--neon-orange` | `#ff6b35` | Warnings, moderate evidence, highlighted regions |
| `--neon-purple` | `#a855f7` | Emerging evidence, special callouts |

### Medical Scale (Cyan Opacity Ramp)

Used for medical-themed UI elements at varying intensities:

| Token | Value |
|-------|-------|
| `--color-medical-50` | `rgba(0, 212, 255, 0.05)` |
| `--color-medical-100` | `rgba(0, 212, 255, 0.1)` |
| `--color-medical-200` | `rgba(0, 212, 255, 0.2)` |
| `--color-medical-300` | `rgba(0, 212, 255, 0.35)` |
| `--color-medical-400` | `#00b8db` |
| `--color-medical-500` | `#00d4ff` |
| `--color-medical-600` | `#33ddff` |
| `--color-medical-700` | `#66e6ff` |
| `--color-medical-800` | `#99eeff` |
| `--color-medical-900` | `#ccf7ff` |

### Accent Scale (Green Opacity Ramp)

| Token | Value |
|-------|-------|
| `--color-accent-50` | `rgba(0, 255, 136, 0.05)` |
| `--color-accent-100` | `rgba(0, 255, 136, 0.1)` |
| `--color-accent-200` | `rgba(0, 255, 136, 0.2)` |
| `--color-accent-300` | `rgba(0, 255, 136, 0.35)` |
| `--color-accent-400` | `#00cc6a` |
| `--color-accent-500` | `#00ff88` |
| `--color-accent-600` | `#33ff9f` |

### Evidence Level Colors

| Level | Color | Hex |
|-------|-------|-----|
| Strong | Green | `#00ff88` |
| Moderate | Orange | `#ff6b35` |
| Emerging | Purple | `#a855f7` |
| Preclinical | Gray | `#64748b` |

### Intensity Scale (Cyan Opacity for Body Map)

| Intensity | Value |
|-----------|-------|
| 1 | `rgba(0, 212, 255, 0.15)` |
| 2 | `rgba(0, 212, 255, 0.30)` |
| 3 | `rgba(0, 212, 255, 0.45)` |
| 4 | `rgba(0, 212, 255, 0.65)` |
| 5 | `rgba(0, 212, 255, 0.85)` |

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `rgba(255, 255, 255, 0.08)` | Default borders |
| `--border-bright` | `rgba(255, 255, 255, 0.15)` | Emphasized borders |

---

## Typography

### Font Family

**Primary:** Inter (loaded via `next/font/google`)

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
```

The Inter font is loaded with the `latin` subset and applied via the `--font-inter` CSS variable on `<html>`.

### Size Scale (Tailwind defaults)

| Class | Size | Usage |
|-------|------|-------|
| `text-[10px]` | 10px | Uppercase labels, tiny metadata |
| `text-xs` | 12px | Tags, badges, sidebar items, legends |
| `text-sm` | 14px | Body text, descriptions, inputs |
| `text-base` | 16px | Large buttons, section text |
| `text-lg` | 18px | Modal titles |
| `text-xl` | 20px | h3 in blog MDX |
| `text-2xl` | 24px | h2 in blog MDX, section headings |
| `text-3xl` | 30px | h1 in blog MDX |
| `text-4xl` | 36px | Hero headlines |

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Buttons, labels, subtle emphasis |
| 600 | `font-semibold` | Headings, card titles, bold labels |
| 700 | `font-bold` | Hero headlines, h1 |

### Rendering

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## Glass-Morphism

Two glass-morphism classes are used throughout the app for elevated surfaces:

### `.glass`

```css
.glass {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**Used for:** Legend bars, floating elements, bottom nav bars.

### `.glass-bright`

```css
.glass-bright {
  background: rgba(26, 31, 46, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
```

**Used for:** Sidebar panels, chat widget, atlas header, elevated panels that need more opacity.

---

## Glow Effects

### CSS Keyframe Animations

#### `glow-pulse` (CTA buttons)

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.2); }
}
```

3-second infinite loop. Applied via `.glow-pulse` class on CTA buttons.

#### `marker-pulse` (Body map dots)

```css
@keyframes marker-pulse {
  0%, 100% { opacity: 0.6; r: 6; }
  50% { opacity: 1; r: 8; }
}
```

SVG circle radius and opacity pulse. Applied via `.marker-dot` class.

#### `marker-ring-pulse` (Selected region ring)

```css
@keyframes marker-ring-pulse {
  0% { opacity: 0.5; r: 10; }
  100% { opacity: 0; r: 20; }
}
```

Expanding ring that fades out. Applied via `.marker-ring` class.

#### `glow-breathe` (Body SVG regions)

```css
@keyframes glow-breathe {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.7)); }
}
```

Subtle breathing glow on active regions.

#### `dash` (Pathway lines)

```css
@keyframes dash {
  to { stroke-dashoffset: -12; }
}
```

Animated dashed line for pathway visualization.

### SVG Glow Filters

Defined in `BodyGlowFilter` component:

| Filter ID | Effect |
|-----------|--------|
| `#glow-cyan` | Standard cyan glow for hovered regions |
| `#glow-cyan-strong` | Intense cyan glow for selected/active regions |
| `#glow-green` | Green glow for pathway dots |

### Box Shadow Glow Utilities

Defined in `@theme inline`:

| Token | Value |
|-------|-------|
| `--shadow-glow-cyan` | `0 0 20px 4px rgba(0, 212, 255, 0.3)` |
| `--shadow-glow-green` | `0 0 20px 4px rgba(0, 255, 136, 0.3)` |
| `--shadow-glow-orange` | `0 0 20px 4px rgba(255, 107, 53, 0.3)` |
| `--shadow-glow-cyan-strong` | `0 0 35px 8px rgba(0, 212, 255, 0.5)` |

### Text Glow Utilities

```css
.text-glow-cyan {
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3);
}

.text-glow-green {
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3);
}
```

---

## Animation Patterns

### Framer Motion

**Constants** (from `src/lib/constants.ts`):

```typescript
ANIMATION = {
  glow: { duration: 0.2, blur: 6 },
  sidebar: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  pathway: { dotDuration: 3, maxConcurrent: 5, dotRadius: 4 },
  card: { stagger: 0.05 },
}
```

**Common variants:**

| Pattern | Usage |
|---------|-------|
| `fadeUp` | Hero section elements: `{ opacity: 0, y: 24 } -> { opacity: 1, y: 0 }` with staggered delays |
| `layout` | PeptideCard uses `motion.div` with `layout` prop for smooth reflow |
| `AnimatePresence` | Card lists, modal, chat panel, sidebar panel |
| `motion.div` initial/animate/exit | Chat panel, modal, sidebar panel slide-in |

**Entrance pattern for cards:**
```typescript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
```

### GSAP

Used for pathway animations on the body map SVG:
- Animated dots traveling along pathway lines between body regions
- Configured via `ANIMATION.pathway` constants
- `@gsap/react` integration for React lifecycle management

### CSS Transitions

Most interactive elements use CSS transitions for hover/focus states:

```css
transition-all duration-200  /* Standard hover transitions */
transition-all duration-150  /* Sidebar nav items (snappier) */
transition-colors           /* Color-only changes */
```

### `.fade-in-up` (Scroll reveal)

```css
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

Used with intersection observer for scroll-triggered reveals on marketing pages.

---

## Grid Background

```css
.grid-bg {
  background-image:
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0);
  background-size: 40px 40px;
}
```

A subtle dot grid pattern used as background on the body map area and hero section. The dots are nearly invisible (`0.03` opacity) to provide subtle depth without distraction.

---

## Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

Applied to hero headlines and the logo for a cyan-to-green gradient text effect.

---

## Component Patterns

### Buttons (4 variants)

| Variant | Background | Border | Text | Hover | Glow |
|---------|-----------|--------|------|-------|------|
| `primary` | `neon-cyan/20` | `neon-cyan/30` | `neon-cyan` | `neon-cyan/30` | `0 0 10px rgba(0,212,255,0.15)` |
| `secondary` | `white/5%` | `white/8%` | `foreground` | `white/8%` | None |
| `ghost` | None | None | `text-secondary` | `white/5%` | None |
| `outline` | None | `white/10%` | `text-secondary` | `neon-cyan/5%` | None |

**Sizes:** `sm` (text-sm, px-3 py-1.5), `md` (text-sm, px-4 py-2), `lg` (text-base, px-6 py-2.5)

**Focus:** All variants show `outline-2 outline-offset-2 outline-neon-cyan` on `focus-visible`.

### Tags (3 variants + active state)

| Variant | Background | Border | Text |
|---------|-----------|--------|------|
| `default` | `white/5%` | `white/8%` | `text-secondary` |
| `medical` | `neon-cyan/10` | `neon-cyan/20` | `neon-cyan` |
| `accent` | `neon-green/10` | `neon-green/20` | `neon-green` |
| Active (any) | `neon-cyan/20` | `neon-cyan/40` | `neon-cyan` + glow |

**Shape:** `rounded-full` (pill)
**Sizes:** `sm` (text-xs, px-2.5 py-0.5), `md` (text-sm, px-3 py-1)

### Cards (Glass-morphism with hover glow)

```
Default:   border-white/6%, bg-white/2%
Hover:     border-neon-cyan/20, bg-white/4%, shadow 0 0 10px cyan/5%
Selected:  border-neon-cyan/40, bg-neon-cyan/6%, shadow 0 0 15px cyan/10%
```

Cards use `rounded-xl` and `transition-all duration-200` for smooth state changes.

### Panels (Sidebar slide-in)

- `glass-bright` background
- Animated with Framer Motion (slide from right)
- Duration: 0.3s with custom ease curve
- Close button in header
- Scrollable content area

### CTA Button (Marketing)

- Rounded pill shape (`rounded-full`)
- Cyan neon styling with `glow-pulse` animation
- Arrow icon suffix
- Rendered as `<Link>` for navigation

---

## Scrollbar

Custom scrollbar styling for webkit browsers:

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
```

Thin, subtle scrollbar that doesn't distract from content.

---

## Responsive Breakpoints

From `src/lib/constants.ts`:

| Token | Width | Tailwind Class |
|-------|-------|---------------|
| `sm` | 640px | `sm:` |
| `md` | 768px | `md:` |
| `lg` | 1024px | `lg:` |
| `xl` | 1280px | `xl:` |

These match Tailwind's default breakpoints.

---

## Dark Theme Only

PeptideAtlas is designed exclusively for dark mode. There is no light mode, no `prefers-color-scheme` media query, and no theme toggle. The `<html>` element does not use a `dark` class -- the dark colors are applied directly via CSS custom properties on `:root`.

This is intentional: the neon glow effects, glass-morphism, and SVG glow filters are designed specifically for dark backgrounds and would not translate well to a light theme.
