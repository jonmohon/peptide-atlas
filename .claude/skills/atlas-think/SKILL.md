---
name: atlas-think
description: "Pre-implementation deep analysis for PeptideAtlas features"
argument-hint: "[feature or problem to analyze]"
---

# Pre-Implementation Analysis

You are performing a **deep analysis** before implementing: `$ARGUMENTS`

## Dynamic Context

Recent changes:
!`git log --oneline -15`

Current data models:
!`cat amplify/data/resource.ts | head -80`

## Analysis Framework

### 1. Scope Assessment

Analyze `$ARGUMENTS` for:
- Which existing files will be modified
- Which new files need to be created
- Which Amplify Data models are involved
- Which AI endpoints are needed

### 2. Existing Pattern Match

Find 2-3 existing implementations that are similar to what we're building:
- Search for analogous components, pages, or API routes
- Identify reusable patterns (especially AI endpoint patterns, form patterns, chart patterns)

### 3. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| (identify risks) | HIGH/MEDIUM/LOW | (how to handle) |

### 4. Implementation Plan

Produce an ordered step list:
1. Data model changes (if any)
2. API routes / server-side logic
3. UI components
4. Page assembly
5. Integration and testing

## Output Format

1. **Executive Summary** — 2-3 sentences, what this feature is and the approach
2. **Files to Create/Modify** — Table with file path, action (create/modify), description
3. **Priority Actions** — Top 3 things to build first
4. **Dependencies** — What must exist before this can be built

## Ground Rules

- Reference real files and line numbers, not hypothetical code.
- Check if similar patterns already exist before proposing new ones.
- Always consider tier gating — is this a free, Pro, or Pro+ feature?
