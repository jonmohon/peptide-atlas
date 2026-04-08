# Data Model

All data in PeptideAtlas is defined as static TypeScript constants. There is no database -- peptide data, stacks, effects, body regions, and other reference data live in `src/data/` and are imported directly by components and API routes.

## Type Definitions

All interfaces are in `src/types/` and re-exported from `src/types/index.ts`.

---

## Peptide

**File:** `src/types/peptide.ts`
**Data file:** `src/data/peptides.ts` (31 entries)

### `Peptide` interface

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (e.g., `"bpc-157"`) |
| `slug` | `string` | URL-safe slug, typically same as id |
| `name` | `string` | Display name (e.g., `"BPC-157"`) |
| `abbreviation` | `string` | Short form (e.g., `"BPC"`) |
| `fullName` | `string` | Full scientific name (e.g., `"Body Protection Compound-157"`) |
| `category` | `PeptideCategory` | One of 8 categories (see enum below) |
| `description` | `string` | 1-3 sentence educational description |
| `effects` | `string[]` | Effect IDs this peptide produces (e.g., `["gut-healing", "joint-repair"]`) |
| `affectedRegions` | `RegionEffect[]` | Body regions targeted with intensity ratings |
| `commonStacks` | `string[]` | Stack IDs this peptide appears in |
| `dosing` | `DosingProtocol` | Typical dosing information |
| `timeline` | `TimelinePhase[]` | Expected results timeline by week |
| `evidenceLevel` | `EvidenceLevel` | Research evidence strength |
| `ratings` | `PeptideRatings` | 6-dimensional rating profile |
| `keyStudies` | `string[]` (optional) | Notable research study references |
| `contraindications` | `string[]` (optional) | Conditions where this peptide should not be used |
| `sideEffects` | `string[]` (optional) | Known side effects |

### `PeptideCategory` enum

| Value | Description |
|-------|-------------|
| `growth-hormone` | GH secretagogues and related peptides |
| `healing-repair` | Tissue healing and recovery peptides |
| `cognitive` | Nootropic and brain-function peptides |
| `metabolic` | Weight management and metabolism peptides |
| `immune` | Immune system modulating peptides |
| `sexual-health` | Sexual function and hormone peptides |
| `longevity` | Anti-aging and longevity peptides |
| `sleep-recovery` | Sleep quality and recovery peptides |

### `EvidenceLevel` enum

Represents the strength of scientific research supporting a peptide's effects:

| Value | Color | Description |
|-------|-------|-------------|
| `strong` | Green (`#00ff88`) | Multiple human clinical trials with consistent results |
| `moderate` | Orange (`#ff6b35`) | Some human studies or strong animal data |
| `emerging` | Purple (`#a855f7`) | Early-stage research, limited human data |
| `preclinical` | Gray (`#64748b`) | Animal or in-vitro studies only |

### `DosingProtocol` interface

| Field | Type | Description |
|-------|------|-------------|
| `route` | `AdministrationRoute` | How the peptide is administered |
| `typicalDose` | `string` | Dose range (e.g., `"250-500mcg"`) |
| `frequency` | `string` | How often (e.g., `"daily"`, `"2x per week"`) |
| `cycleLength` | `string` | Recommended cycle duration (e.g., `"4-8 weeks"`) |
| `notes` | `string` (optional) | Additional dosing notes |

### `AdministrationRoute` enum

| Value | Description |
|-------|-------------|
| `subcutaneous` | Injection under the skin |
| `oral` | Taken by mouth |
| `nasal` | Nasal spray |
| `topical` | Applied to skin surface |
| `intramuscular` | Injection into muscle |

### `TimelinePhase` interface

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Phase name (e.g., `"Initial Response"`) |
| `weekStart` | `number` | Starting week number |
| `weekEnd` | `number` | Ending week number |
| `description` | `string` | What to expect during this phase |

### `RegionEffect` interface

| Field | Type | Description |
|-------|------|-------------|
| `regionId` | `RegionId` | Which body region is affected |
| `intensity` | `1 \| 2 \| 3 \| 4 \| 5` | How strongly the peptide affects this region |
| `description` | `string` | Description of the effect on this region |

### `PeptideRatings` interface

All ratings are on a 1-10 scale:

| Field | Description |
|-------|-------------|
| `efficacy` | How effective the peptide is for its intended use |
| `evidence` | Strength of scientific research supporting claims |
| `easeOfUse` | How simple administration and protocol adherence is |
| `cost` | Affordability (10 = very affordable, 1 = very expensive) |
| `safety` | Safety profile (10 = very safe, 1 = significant risks) |
| `popularity` | How widely used/discussed in the community |

These ratings power the comparison radar chart and the `IntensityIndicator` display on peptide cards.

---

## Body Region

**File:** `src/types/body.ts`
**Data file:** `src/data/body-regions.ts` (13 entries)

### `BodyRegion` interface

| Field | Type | Description |
|-------|------|-------------|
| `id` | `RegionId` | Unique region identifier |
| `label` | `string` | Human-readable name (e.g., `"Brain"`) |
| `svgGroupId` | `string` | Corresponding SVG group ID for rendering |
| `description` | `string` | Educational description of the region |
| `position` | `{ x: number; y: number }` | Marker position in SVG coordinate space (viewBox `0 0 100 210`) |
| `relatedEffects` | `string[]` | Effect IDs relevant to this region |

### `RegionId` enum

| Value | Body Area |
|-------|-----------|
| `brain` | Brain / central nervous system |
| `pituitary` | Pituitary gland |
| `heart` | Cardiovascular system |
| `lungs` | Respiratory system |
| `liver` | Liver / hepatic system |
| `gut` | Gastrointestinal tract |
| `kidneys` | Renal system |
| `muscles` | Skeletal muscle tissue |
| `joints` | Joints / connective tissue |
| `skin` | Skin / integumentary system |
| `bones` | Skeletal system |
| `reproductive` | Reproductive system |
| `immune-system` | Immune system (thymus, lymph) |

### `RegionHighlight` interface

Used by the body map to display highlight states:

| Field | Type | Description |
|-------|------|-------------|
| `regionId` | `RegionId` | Which region |
| `intensity` | `number` | Highlight intensity (0-5) |
| `color` | `string` | CSS color for the highlight |

---

## Stack

**File:** `src/types/stack.ts`
**Data file:** `src/data/stacks.ts` (10 entries)

### `Stack` interface

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique stack identifier |
| `name` | `string` | Display name (e.g., `"Recovery Stack"`) |
| `slug` | `string` | URL-safe slug |
| `goal` | `string` | Primary goal (e.g., `"Accelerate healing"`) |
| `description` | `string` | Full description of the stack's purpose |
| `peptides` | `StackPeptide[]` | Peptides in this stack with their roles |
| `combinedEffects` | `string[]` | Aggregate effects of all peptides combined |
| `highlightedRegions` | `{ regionId: RegionId; intensity: number }[]` | Regions lit up on the body map |
| `icon` | `string` | Emoji or icon identifier |

### `StackPeptide` interface

| Field | Type | Description |
|-------|------|-------------|
| `peptideId` | `string` | References a peptide's `id` field |
| `role` | `'primary' \| 'synergist' \| 'support'` | The peptide's role in the stack |
| `notes` | `string` (optional) | Why this peptide is included |

---

## Effect

**File:** `src/types/effect.ts`
**Data file:** `src/data/effects.ts` (27 entries)

### `Effect` interface

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique effect identifier (e.g., `"gut-healing"`) |
| `label` | `string` | Display name (e.g., `"Gut Healing"`) |
| `category` | `EffectCategory` | Effect category grouping |
| `description` | `string` | What this effect does |
| `primaryRegions` | `RegionId[]` | Body regions where this effect manifests |
| `relatedPeptideIds` | `string[]` | Peptides that produce this effect |
| `icon` | `string` | Emoji or icon identifier |

### `EffectCategory` enum

| Value | Description |
|-------|-------------|
| `body-composition` | Muscle growth, fat loss, body recomposition |
| `healing` | Tissue repair, wound healing, recovery |
| `cognitive` | Focus, memory, neuroprotection |
| `longevity` | Anti-aging, cellular repair |
| `sleep` | Sleep quality, circadian rhythm |
| `sexual` | Sexual function, libido |
| `immune` | Immune modulation, anti-inflammatory |

---

## Comparison

**File:** `src/types/comparison.ts`

### `ComparisonAxis` type

```typescript
type ComparisonAxis = keyof PeptideRatings;
// = 'efficacy' | 'evidence' | 'easeOfUse' | 'cost' | 'safety' | 'popularity'
```

### `ComparisonData` interface

| Field | Type | Description |
|-------|------|-------------|
| `peptideIds` | `string[]` | Up to 4 peptide IDs to compare |
| `axes` | `ComparisonAxis[]` | Which rating dimensions to display |

---

## Blog Types

**File:** `src/types/blog.ts`

### `BlogPost` interface

| Field | Type | Description |
|-------|------|-------------|
| `slug` | `string` | URL slug derived from filename |
| `title` | `string` | Post title |
| `date` | `string` | Publication date |
| `category` | `string` | Post category |
| `excerpt` | `string` | Short summary for cards/previews |
| `coverImage` | `string` (optional) | Cover image path |
| `author` | `string` | Author name (defaults to `"PeptideAtlas Team"`) |
| `tags` | `string[]` | Tags for filtering |
| `readingTime` | `string` | Calculated reading time (e.g., `"5 min read"`) |
| `content` | `string` | Raw MDX content body |

### `BlogPostMeta` type

Same as `BlogPost` but without the `content` field. Used for blog index listings.

---

## Data Relationships Diagram

```
                    Peptide
                   /   |   \
                  /    |    \
                 /     |     \
    affectedRegions  effects  commonStacks
          |            |           |
          v            v           v
      BodyRegion    Effect       Stack
          |            |           |
   relatedEffects  relatedPeptideIds  peptides[].peptideId
          |            |           |
          v            v           v
        Effect      Peptide     Peptide
```

**Key relationships:**
- A `Peptide` targets multiple `BodyRegion`s (via `affectedRegions`)
- A `Peptide` produces multiple `Effect`s (via `effects[]`)
- A `Peptide` belongs to multiple `Stack`s (via `commonStacks[]`)
- An `Effect` maps back to multiple `Peptide`s (via `relatedPeptideIds`)
- An `Effect` maps to multiple `BodyRegion`s (via `primaryRegions`)
- A `Stack` contains multiple `Peptide`s (via `peptides[].peptideId`)
- A `BodyRegion` references related `Effect`s (via `relatedEffects`)

---

## How to Add New Data

### Adding a new peptide

1. Add an entry to the `peptides` array in `src/data/peptides.ts`
2. Follow the `Peptide` interface exactly
3. Use existing `RegionId` values for `affectedRegions`
4. Reference existing effect IDs in the `effects` array, or create new effects first
5. Set `affectedRegions` intensity values 1-5 (1 = minor, 5 = primary target)
6. Set all 6 `ratings` values on a 1-10 scale
7. Add the peptide to relevant stacks in `src/data/stacks.ts`
8. Update `src/data/effects.ts` to include the new peptide's ID in `relatedPeptideIds`

### Adding a new body region

1. Add the new value to the `RegionId` union type in `src/types/body.ts`
2. Add a `BodyRegion` entry in `src/data/body-regions.ts` with SVG coordinates
3. Add SVG path data in `src/lib/svg-paths.ts`
4. Update any peptides that should reference the new region

### Adding a new effect

1. Add an `Effect` entry in `src/data/effects.ts`
2. Set `primaryRegions` to the body regions where this effect occurs
3. Set `relatedPeptideIds` to all peptides that produce this effect
4. Update the peptides' `effects` arrays to include the new effect ID
5. Update body regions' `relatedEffects` if appropriate

### Adding a new stack

1. Add a `Stack` entry in `src/data/stacks.ts`
2. Reference existing peptide IDs in the `peptides` array
3. Assign roles: `primary` (main peptide), `synergist` (enhances primary), `support` (secondary benefit)
4. Set `highlightedRegions` to show which body areas the stack targets
5. Update the referenced peptides' `commonStacks` arrays

## Data Counts

| Data Type | Count | File |
|-----------|-------|------|
| Peptides | 31 | `src/data/peptides.ts` |
| Stacks | 10 | `src/data/stacks.ts` |
| Effects | 27 | `src/data/effects.ts` |
| Body Regions | 13 | `src/data/body-regions.ts` |
| Categories | 8 | `src/data/categories.ts` |
| Glossary Terms | 21 | `src/data/glossary.ts` |
| FAQ Items | 15 | `src/data/faq.ts` |
| Blog Posts | 5 | `content/blog/*.mdx` |
