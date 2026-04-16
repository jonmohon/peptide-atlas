# Tools

Practical calculators and planners for peptide users. These are the "daily use" features that drive Pro subscriptions.

**Related Documentation:**
- [Journal](journal.md) - Dosing data feeds from journal entries
- [Database](database.md) - Data models for saved cycles and schedules
- [Architecture](ARCHITECTURE.md) - Where tools live in the route structure

---

> Status: IN PROGRESS — Reconstitution calculator implemented. Cycle planner and dosing schedule planned.

## Overview

Tools live at `/atlas/tools/` with a hub page linking to each tool. All tools are Pro-tier features (gated by PremiumGate).

```
/atlas/tools                    # Hub page with tool cards
├── /atlas/tools/reconstitution # ✅ IMPLEMENTED
├── /atlas/tools/cycle-planner  # 🔲 PLANNED
└── /atlas/tools/schedule       # 🔲 PLANNED
```

## Reconstitution Calculator (Implemented)

**Page**: `/atlas/tools/reconstitution`

Calculates injection volume from vial size, water added, and desired dose. The #1 most-asked question in peptide communities.

| Component | File | Purpose |
|-----------|------|---------|
| Page | `src/app/(atlas)/atlas/tools/reconstitution/page.tsx` | Page shell |
| Calculator | `src/components/tools/reconstitution-calculator.tsx` | Full calculator UI |
| Syringe | `src/components/tools/syringe-visual.tsx` | Animated SVG syringe |
| Data | `src/data/reconstitution.ts` | Reconstitution info for 29 peptides |

## Cycle Planner (Planned)

**Page**: `/atlas/tools/cycle-planner`

Interactive calendar for planning multi-peptide on/off cycles.

Features:
- Calendar grid (week/month toggle)
- Add peptides with start date, end date, frequency
- Visual timeline bars showing overlapping cycles
- AI analysis: sequencing, washout periods, bloodwork timing
- Export as PDF or .ics

## Dosing Schedule (Planned)

**Page**: `/atlas/tools/schedule`

Daily schedule generated from active protocol.

Features:
- Time-block layout: Morning / Afternoon / Evening / Bedtime
- Peptide name, dose, injection site, food timing per block
- Injection site rotation tracker
- Export to .ics calendar

## See Also

- [Journal](journal.md) - Daily dose logging integrates with tools
- [AI System](AI-FEATURES.md) - AI cycle analysis endpoint
