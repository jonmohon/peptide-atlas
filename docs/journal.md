# Journal & Tracking System

Daily dose logging, body metrics, bloodwork tracking, and AI-powered insight reports. The retention anchor of PeptideAtlas.

**Related Documentation:**
- [Database](database.md) - JournalEntry, BloodworkPanel, AiInsightReport models
- [AI System](AI-FEATURES.md) - Journal insight and bloodwork AI endpoints
- [Auth & Payments](auth-and-payments.md) - Tier gating for premium journal features

---

> Status: PLANNED — This is a specification. Implementation has not started.

## Overview

The journal is designed to be opened daily. Users log peptide doses, subjective ratings (mood/energy/sleep), and optionally body metrics, diet, side effects, and photos. The more data they log, the better their AI insights become. This creates a retention flywheel:

```
Log Doses Daily → AI Learns Your Pattern → Weekly Insight Report
     ↑                                            ↓
     └──── Personalized Recommendations ←──────────┘
```

## Pages

### `/atlas/journal` — Dashboard
- Calendar heatmap (green=logged, gray=missed, cyan=today)
- Today's entry card (quick-add if empty, summary if filled)
- Logging streak counter
- Trend sparklines: weight, mood, energy, sleep (recharts LineChart)
- Recent AI insight report cards

### `/atlas/journal/[date]` — Daily Entry
- Date header with prev/next navigation
- Collapsible sections:
  - **Doses**: Multi-row form (peptide select, dose, unit, route, injection site, time). Pre-fills from yesterday.
  - **Subjective**: Mood (1-10), energy (1-10), sleep quality (1-10), sleep hours. Slider inputs.
  - **Body Metrics**: Weight, body fat, measurements (waist, chest, arms, thighs).
  - **Diet**: Textarea for diet notes.
  - **Side Effects**: Multi-select from common list + freeform.
  - **Photos**: Upload grid with category (progress, injection site, bloodwork, other).
  - **Notes**: General textarea.
- "Copy from yesterday" button for dose repetition.
- Save writes to JournalEntry model.

### `/atlas/journal/bloodwork` — Bloodwork Tracker
- List of panels sorted by date
- Upload flow: drag-and-drop PDF/image → `/api/ai/parse-bloodwork` → editable table → save
- Manual entry: form with add/remove marker rows
- Per-panel: markers with reference range flags, AI interpretation, trend charts
- Key markers tracked: IGF-1, GH, testosterone, liver enzymes, glucose, HbA1c, lipids

### `/atlas/journal/insights` — AI Insight Reports
- List of weekly/monthly reports with generation dates
- "Generate Report" button (selects period, calls `/api/ai/journal-insight`)
- Report sections: summary, trends (with embedded charts), correlations, concerns, recommendations

## UI Components

```
src/components/journal/
├── calendar-heatmap.tsx      # Monthly grid, colored by completion
├── streak-counter.tsx        # Current streak + best streak
├── trend-sparklines.tsx      # Mini recharts LineChart for dashboard
├── dose-log.tsx              # Multi-row dose entry form
├── metric-sliders.tsx        # Mood/energy/sleep slider inputs
├── side-effect-picker.tsx    # Multi-select with severity
├���─ photo-upload.tsx          # S3 upload with category
├── bloodwork-upload.tsx      # Drag-and-drop + AI parse flow
├── bloodwork-table.tsx       # Editable marker table
├── marker-trends.tsx         # Recharts line chart across panels
└── insight-report.tsx        # Structured report renderer
```

## State Management

New store: `src/stores/use-journal-store.ts`
- `todayDraft`: In-memory draft of today's entry (prevents data loss when switching sections)
- `calendarData`: Map of date → completion status for heatmap
- `streak`: Current and best streak numbers
- `loadEntry(date)`: Fetch from Amplify Data
- `saveEntry()`: Write to Amplify Data
- `copyFromYesterday()`: Clone previous day's doses

## AI Endpoints

| Route | Purpose | Input | Output |
|-------|---------|-------|--------|
| `/api/ai/journal-insight` | Weekly/monthly analysis | entries[], period | Structured JSON |
| `/api/ai/bloodwork` | Interpret lab panel | markers[], userContext | Text stream |
| `/api/ai/parse-bloodwork` | Extract markers from image | base64 image | Structured JSON |

## Tier Access

| Feature | FREE | PRO | PRO+ |
|---------|------|-----|------|
| Daily logging (doses + notes) | 7 days | Unlimited | Unlimited |
| Body metrics + ratings | — | Yes | Yes |
| Photo uploads | — | 5/month | Unlimited |
| Weekly AI insights | — | — | Unlimited |
| Monthly AI insights | — | 1 preview | Unlimited |
| Bloodwork upload + AI parse | — | — | Unlimited |
| Bloodwork manual entry | — | 2 panels | Unlimited |
| Trend charts | — | 30 days | All time |

## Gotchas

- **"Copy from yesterday" must handle missing days**: If yesterday has no entry, look back up to 7 days for the most recent entry.
- **JSON dose structure varies**: Some users take 1 peptide, others take 5. The dose form must be dynamic (add/remove rows).
- **Bloodwork AI parsing is imperfect**: Always show parsed markers in an editable table so users can correct OCR errors before saving.
- **Calendar heatmap needs efficient queries**: Don't fetch full entries for the calendar — query by date range and return only dates + completion status.

## See Also

- [Database](database.md) - Model definitions
- [Tools](tools.md) - Reconstitution calculator (related to dosing)
- [AI System](AI-FEATURES.md) - Full AI endpoint reference
