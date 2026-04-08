# Component Library

PeptideAtlas has 49 React components organized into 8 directories. This document covers the purpose, props, and usage patterns for each key component.

## Directory Structure

```
src/components/
  ├── ai/              11 AI-powered components
  ├── body/             6 body map rendering components
  ├── blog/             3 blog system components
  ├── layout/           6 layout/navigation components
  ├── marketing/       11 landing/content page components
  ├── peptides/         1 peptide display component
  ├── shared/           4 shared utility components
  └── ui/               7 base UI primitives
```

---

## Body Map Components (`src/components/body/`)

These components render the interactive body SVG with region markers, highlights, glow effects, and pathway animations.

### BodySvg

**File:** `src/components/body/body-svg.tsx`
**Purpose:** Root SVG component rendering the body silhouette, interactive region markers, and pathway overlay.

| Prop | Type | Description |
|------|------|-------------|
| `hoveredRegion` | `RegionId \| null` | Currently hovered region |
| `selectedRegion` | `RegionId \| null` | Currently selected region |
| `highlightedRegions` | `Map<RegionId, RegionHighlight>` | Regions with active highlights |
| `activePathways` | `Pathway[]` | Pathway data for animation overlay |
| `showPathways` | `boolean` | Whether to render pathway animations |
| `onRegionHover` | `(regionId: RegionId \| null) => void` | Hover callback |
| `onRegionClick` | `(regionId: RegionId) => void` | Click callback |
| `className` | `string` | Optional CSS class |

**Rendering layers (bottom to top):**
1. Grid dot background pattern
2. Body silhouette polygons (from `react-body-highlighter` data, viewBox `0 0 100 210`)
3. Interactive region markers (`BodyRegion` components)
4. Pathway overlay animations (`PathwayOverlay`)

**SVG filters:** Defined in `BodyGlowFilter` -- provides `#glow-cyan`, `#glow-cyan-strong`, `#glow-green` filters.

### BodyRegion

**File:** `src/components/body/body-region.tsx`
**Purpose:** Renders a single interactive region marker (glowing dot with hover/selection states).

| Prop | Type | Description |
|------|------|-------------|
| `regionId` | `RegionId` | Region identifier |
| `path` | `string` | SVG path data for the marker |
| `label` | `string` | Accessible label |
| `isHovered` | `boolean` | Hover state |
| `isSelected` | `boolean` | Selection state |
| `highlightIntensity` | `number` | 0-5 intensity for highlight brightness |
| `onHover` | `(regionId: RegionId \| null) => void` | Hover callback |
| `onClick` | `(regionId: RegionId) => void` | Click callback |

**Visual states:**
- Default: Cyan dot with subtle pulse animation (`.marker-dot`)
- Hovered: White glow with expanded ring
- Selected: Green glow with strong pulse (`.marker-ring`)
- Highlighted: Orange glow scaled to intensity

### BodyMapView

**File:** `src/components/body/body-map-view.tsx`
**Purpose:** Full body map page layout including left sidebar (filters), center SVG, and right detail panel.

| Prop | Type | Description |
|------|------|-------------|
| `peptides` | `Peptide[]` | Full peptide dataset to display |

**Sub-components used:** `BodySvg`, `SidebarPanel`, `PeptideCard`, `Tag`, `Button`, `RegionSuggestion`

**Layout:** Three-panel flex layout -- collapsible left sidebar (categories + region list), centered body SVG with legend bar, slide-in right panel for region/peptide details.

### Other Body Components

| Component | Purpose |
|-----------|---------|
| `BodyGlowFilter` | Defines SVG `<filter>` elements for glow effects |
| `BodyLegend` | Bottom legend bar showing marker color meanings |
| `PathwayOverlay` | Animated dots moving along pathway lines between regions |

---

## AI Components (`src/components/ai/`)

### ChatWidget

**File:** `src/components/ai/chat-widget.tsx`
**Purpose:** Global floating chat interface powered by Claude. Available on every page via root layout.

**Key features:**
- Floating button (bottom-right, always visible)
- Expandable chat panel with glass-morphism styling
- Suggestion chips for quick questions
- Streaming message display with typing indicator
- Medical disclaimer
- Uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport`
- State managed by `useChatStore` (allows other components to open chat with pre-filled text)

### StreamingText

**File:** `src/components/ai/streaming-text.tsx`
**Purpose:** Renders text that streams in progressively with a cursor animation.

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string` | The accumulated text so far |
| `isStreaming` | `boolean` | Whether streaming is in progress |

### MechanismExplainer

**File:** `src/components/ai/mechanism-explainer.tsx`
**Purpose:** Explains a peptide's mechanism of action at beginner/intermediate/advanced level.

Uses `useStreamingText` hook to stream from `/api/ai/explain`.

### StackAnalysisPanel

**File:** `src/components/ai/stack-analysis-panel.tsx`
**Purpose:** Displays AI analysis of a peptide stack (synergy score, issues, suggestions, timing).

Fetches structured JSON from `/api/ai/optimize` and renders cards for synergies, issues, and timing schedule.

### AISearchBar

**File:** `src/components/ai/ai-search-bar.tsx`
**Purpose:** Natural language search bar in the AtlasHeader. Sends queries to `/api/ai/search` and displays ranked results.

### Other AI Components

| Component | File | Purpose |
|-----------|------|---------|
| `RegionSuggestion` | `region-suggestion.tsx` | AI suggestion for a selected body region |
| `ComparisonInsights` | `comparison-insights.tsx` | AI-generated comparison analysis |
| `WhatToExpect` | `what-to-expect.tsx` | Timeline predictions for a peptide combination |
| `ProtocolDisplay` | `protocol-display.tsx` | Renders a generated protocol |
| `MedicalDisclaimer` | `medical-disclaimer.tsx` | Reusable medical disclaimer banner |
| `AILoadingSkeleton` | `ai-loading-skeleton.tsx` | Loading placeholder for AI content |

---

## Layout Components (`src/components/layout/`)

### MarketingHeader

**File:** `src/components/layout/marketing-header.tsx`
**Purpose:** Navigation header for marketing/content pages.

**Nav items:** Home, Learn, About, Glossary, FAQ
**CTA:** "Launch Atlas" button linking to `/atlas`
**Styling:** Glass-morphism background, sticky positioning

### AtlasHeader

**File:** `src/components/layout/atlas-header.tsx`
**Purpose:** Navigation header for the interactive atlas tool.

**Nav items:** Body Map, Peptides, Stacks, Effects, Compare
**Features:** Integrated `AISearchBar`, "Back to Site" link
**Styling:** Glass-bright background, compact height

### Logo

**File:** `src/components/layout/logo.tsx`
**Purpose:** PeptideAtlas brand logo with gradient text effect.

### SidebarPanel

**File:** `src/components/layout/sidebar-panel.tsx`
**Purpose:** Slide-in panel from the right side. Used by body map for region/peptide details.

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether the panel is visible |
| `onClose` | `() => void` | Close callback |
| `title` | `string` | Panel header title |
| `children` | `ReactNode` | Panel content |

**Styling:** `glass-bright` background, animated with Framer Motion slide-in.

### Footer

**File:** `src/components/layout/footer.tsx`
**Purpose:** Site footer with links and copyright. Used in marketing layout only.

---

## UI Primitives (`src/components/ui/`)

### Button

**File:** `src/components/ui/button.tsx`
**Purpose:** Base button component with 4 variants and 3 sizes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |

**Variant styles:**

| Variant | Description |
|---------|-------------|
| `primary` | Cyan background/border with glow shadow |
| `secondary` | Subtle white background with thin border |
| `ghost` | No background, text only, hover reveals background |
| `outline` | Border only, hover adds cyan tint |

### Tag

**File:** `src/components/ui/tag.tsx`
**Purpose:** Pill-shaped tag/badge for categories, effects, and filters.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'medical' \| 'accent'` | `'default'` | Color scheme |
| `size` | `'sm' \| 'md'` | `'sm'` | Size preset |
| `active` | `boolean` | `false` | Active/selected state (cyan glow) |
| `onClick` | `() => void` | - | Makes the tag clickable (renders as `<button>`) |

**Variant colors:**
- `default`: White/gray tones
- `medical`: Cyan (#00d4ff) tones
- `accent`: Green (#00ff88) tones

### SearchInput

**File:** `src/components/ui/search-input.tsx`
**Purpose:** Text input with search icon and clear button.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current search value |
| `onChange` | `(value: string) => void` | Change callback |
| `placeholder` | `string` | Placeholder text |

### Modal

**File:** `src/components/ui/modal.tsx`
**Purpose:** Animated modal dialog with backdrop blur and escape-to-close.

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Visibility state |
| `onClose` | `() => void` | Close callback |
| `title` | `string` (optional) | Header title |
| `children` | `ReactNode` | Modal content |

**Features:** Escape key closes, backdrop click closes, body scroll locked when open, Framer Motion entrance/exit animations.

### Other UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `Tooltip` | `tooltip.tsx` | Hover tooltip |
| `FilterDropdown` | `filter-dropdown.tsx` | Dropdown filter selector |
| `Skeleton` | `skeleton.tsx` | Loading skeleton placeholder |

---

## Shared Components (`src/components/shared/`)

### PeptideCard

**File:** `src/components/peptides/peptide-card.tsx`
**Purpose:** Card displaying a peptide's name, category icon, evidence badge, effects, and ratings.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `peptide` | `Peptide` | - | Peptide data to display |
| `isSelected` | `boolean` | `false` | Selected state (cyan border + glow) |
| `onClick` | `() => void` | - | Click handler |
| `compact` | `boolean` | `false` | Reduced layout for sidebar usage |

**Compact mode:** Hides description, full name, and ratings. Limits effect tags to 3.

### EvidenceBadge

**File:** `src/components/shared/evidence-badge.tsx`
**Purpose:** Color-coded badge showing evidence level.

| Prop | Type | Description |
|------|------|-------------|
| `level` | `EvidenceLevel` | `'strong'` \| `'moderate'` \| `'emerging'` \| `'preclinical'` |

**Colors:** Strong = green, Moderate = orange, Emerging = purple, Preclinical = gray

### CategoryIcon

**File:** `src/components/shared/category-icon.tsx`
**Purpose:** Icon representing a peptide category.

| Prop | Type | Description |
|------|------|-------------|
| `category` | `PeptideCategory` | Which category to display |
| `size` | `'sm' \| 'md'` | Icon size |

### Other Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| `IntensityIndicator` | `intensity-indicator.tsx` | Visual dots showing 1-5 intensity |
| `SourceCitation` | `source-citation.tsx` | Formatted research citation |

---

## Marketing Components (`src/components/marketing/`)

### HeroSection

**File:** `src/components/marketing/hero-section.tsx`
**Purpose:** Landing page hero with gradient text, tagline, and CTA button.

**Features:** Framer Motion staggered fade-up animations, radial gradient glow background, `grid-bg` pattern.

### CTAButton

**File:** `src/components/marketing/cta-button.tsx`
**Purpose:** Prominent call-to-action link with glow-pulse animation.

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Link destination |
| `children` | `ReactNode` | Button label |

**Styling:** Rounded pill, cyan glow, arrow icon, `glow-pulse` CSS animation.

### FeatureShowcase

**File:** `src/components/marketing/feature-showcase.tsx`
**Purpose:** Grid of feature cards highlighting platform capabilities.

### Other Marketing Components

| Component | File | Purpose |
|-----------|------|---------|
| `GradientText` | `gradient-text.tsx` | Text with cyan-to-green gradient fill |
| `PageContainer` | `page-container.tsx` | Max-width centered container with padding |
| `SectionHeading` | `section-heading.tsx` | Section title with decorative elements |
| `StatsBar` | `stats-bar.tsx` | Animated counter statistics |
| `AtlasPreview` | `atlas-preview.tsx` | Preview screenshot/mockup of the atlas |
| `HowItWorks` | `how-it-works.tsx` | Step-by-step explanation section |
| `CTASection` | `cta-section.tsx` | Bottom-of-page call to action |
| `FaqAccordion` | `faq-accordion.tsx` | Expandable FAQ section |

---

## Blog Components (`src/components/blog/`)

### BlogCard

**File:** `src/components/blog/blog-card.tsx`
**Purpose:** Card for blog post previews in the index listing.

Displays title, excerpt, category, date, reading time, and tags.

### BlogIndex

**File:** `src/components/blog/blog-index.tsx`
**Purpose:** Blog listing page with search and category filtering.

### MdxComponents

**File:** `src/components/blog/mdx-components.tsx`
**Purpose:** Custom component mappings for MDX rendering.

See [BLOG-SYSTEM.md](./BLOG-SYSTEM.md) for the full list of custom MDX components.

---

## Design System Integration

All components follow these patterns:

- **Dark theme only** -- no light mode support
- **Glass-morphism** -- panels use `.glass` or `.glass-bright` classes
- **Glow effects** -- selected/active states use colored `box-shadow` glows
- **Framer Motion** -- entrance/exit animations on cards, panels, modals
- **Tailwind v4** -- utility classes with custom `@theme inline` properties
- **`cn()` utility** -- `clsx` wrapper for conditional class composition
- **Focus-visible** -- keyboard focus uses cyan outline (`focus-visible:outline-neon-cyan`)
