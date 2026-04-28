# Image Prompts — Peptide Atlas Marketing & App

These prompts are designed for **Higgsfield (nano banana pro)** generation. Each prompt has a target file path, aspect ratio, and notes on usage. After you generate, drop the zip into `public/` and Claude will wire them up.

## Brand & Style Guide

Bake these into every prompt to keep the look cohesive:

- **Palette:** deep navy/charcoal background (`#0A0F1C`–`#020817`), neon cyan (`#00D4FF`), neon purple (`#A855F7`), neon green (`#39FF14`), neon orange (`#FF8C00`), neon pink (`#EC4899`)
- **Mood:** "scientific, futuristic, premium medical" — think Apple keynote × Stripe × WHOOP × biotech research lab
- **Style keywords to include:** `glassmorphism, soft glow, subtle grid background, depth-of-field bokeh, cinematic lighting, 8K render, ultra-detailed, photoreal`
- **Style keywords to avoid:** `cartoon, illustration, doodle, hand-drawn, low-poly, retro, sci-fi alien`
- **Typography:** keep image text to a minimum — UI mockups should use legible sans-serif (Inter / SF Pro)
- **Subjects:** when showing people, prefer diverse, fit, athletic 25–45 year olds, no faces visible (back of head, side profile, hands only) to avoid model-rights issues

---

## 1. Hero Background

**Path:** `public/hero/hero-bg.png`
**Aspect Ratio:** `16:9` (1920×1080) — also export `21:9` (2560×1080) for ultrawide
**Where it's used:** background of `<HeroSection />` on the landing page

> A dark, cinematic, abstract scientific render of a translucent glowing peptide chain — interlinked amino acid spheres in neon cyan and neon purple — floating against a deep navy void. Subtle hexagonal grid pattern fading in the background. Soft volumetric light, depth-of-field bokeh, particles drifting like sparse stars. Premium biotech aesthetic, like a high-end lab visualization. Photoreal 8K render, glassmorphism, soft neon glow, no text, no people.

---

## 2. Mobile Dashboard Mockup (the phone screenshot in the home page)

**Path:** `public/mobile/hero-dashboard.png`
**Aspect Ratio:** `9:19` (1170×2470) — iPhone 15 Pro screen ratio
**Where it's used:** the phone mockup in `<MobileAppSection />`

> A stylized photo-real rendering of an iPhone screen showing a peptide tracking app's dashboard. The screen is dark navy with glassmorphism cards. At the top, a greeting "Good morning, Jon" with today's date. Below: a streak counter showing "12-day streak" with a flame icon, then a 30-day calendar heatmap with cyan-to-purple gradient cells, then three glass cards labeled "Today's Doses", "Energy 7/10", and "Sleep 8h". A bottom tab bar with 5 icons. Soft neon cyan and purple accents. Inter font. Crisp UI, 8K, no logo, no faces. Pure UI mockup, no surrounding hand or device frame.

---

## 3. Mobile App Showcase — Peptide Detail Screen

**Path:** `public/mobile/screen-peptide-detail.png`
**Aspect Ratio:** `9:19` (1170×2470)
**Where it's used:** future App Store / Play Store screenshot reel

> An iPhone screen showing a peptide detail page in a dark, scientific app. Top: a large title "BPC-157" with a cyan "Verified" badge and "Reviewed Apr 2026" subtitle. Below: a tab strip "Overview · Dosing · Studies · Side Effects". Active "Overview" tab shows a body diagram with the abdomen and joints highlighted in cyan, then a glass card "Mechanism" with three short bullet points, then a "Key Studies" card with two PubMed citations (PMID 12345678, PMID 23456789). Glassmorphism, neon cyan accents on a deep navy background. Inter font. 8K, photoreal UI mockup, no surrounding device frame.

---

## 4. Mobile App Showcase — AI Protocol Generator (streaming)

**Path:** `public/mobile/screen-ai-protocol.png`
**Aspect Ratio:** `9:19` (1170×2470)
**Where it's used:** future App Store / Play Store screenshot reel

> An iPhone screen showing an AI peptide protocol generator mid-streaming. Top: header reads "AI Protocol Generator" with a small Claude/sparkle icon. Below: a stage progress bar with three pills — "Drafting" (checkmark, cyan), "Safety Check" (active, glowing purple), "Personalizing" (pending, dim). Below: a chat-style streaming response showing partial markdown text about a healing protocol with a fading cursor at the end. A glass card at bottom labeled "Personalized to: Joint recovery · No allergies · Active lifestyle". Dark navy background, neon cyan/purple. Inter font. 8K UI mockup, no device frame.

---

## 5. Mobile App Showcase — Bloodwork OCR

**Path:** `public/mobile/screen-bloodwork.png`
**Aspect Ratio:** `9:19` (1170×2470)
**Where it's used:** future App Store / Play Store screenshot reel

> An iPhone screen showing a bloodwork interpretation app. Top half: a small thumbnail preview of a lab report with a subtle "Scanned ✓" badge. Below: a bordered card titled "Out of Range" with three rows — "Testosterone · 245 ng/dL · LOW" in red, "Free T3 · 1.8 pg/mL · LOW" in red, "Vitamin D · 22 ng/mL · LOW" in orange. Below that, a glass card with AI-generated interpretation text. Bottom: a "Save to Profile" button with cyan glow. Dark navy app, glassmorphism, Inter font. 8K UI mockup, no device frame.

---

## 6. Feature Illustration — AI Pipeline (multi-stage)

**Path:** `public/features/ai-pipeline.png`
**Aspect Ratio:** `4:3` (1600×1200)
**Where it's used:** could replace icon in Feature Showcase, or used in `/atlas/protocol-generator` empty state

> Three glowing translucent gears or stages connected by neon cyan particle streams, floating in a dark void. The first stage labeled "Draft" glows cyan, the second "Critique" glows purple, the third "Personalize" glows green. Each stage shows abstract data flowing through it. Glassmorphism stage cards, soft volumetric light, hexagonal grid backdrop. 8K photoreal render, scientific, premium biotech aesthetic, no text on the gears beyond the three labels.

---

## 7. Feature Illustration — Verified Citations

**Path:** `public/features/verified-citations.png`
**Aspect Ratio:** `4:3` (1600×1200)
**Where it's used:** Feature Showcase or Verified Catalog landing

> A glowing checkmark seal — neon green — emerging from a stack of translucent floating scientific paper documents. Each document shows a small "PMID" badge and a barcode. Soft cyan particles drift between papers. Dark navy background, depth-of-field bokeh. Premium scientific certification mood. 8K photoreal render, glassmorphism, no text beyond "PMID" labels.

---

## 8. Feature Illustration — Body Map

**Path:** `public/features/body-map.png`
**Aspect Ratio:** `1:1` (1600×1600)
**Where it's used:** Feature Showcase or `/atlas/body-map` empty state

> A clean, anatomical, semi-transparent human body figure (back of head visible, no face) facing forward against a deep navy background. 13 specific regions glow softly in different neon colors — heart cyan, gut purple, joints orange, brain pink, muscles green. Tiny labels float near each region. Like a Holographic medical scanner overlay. Glassmorphism panel behind the figure. 8K photoreal render, scientific visualization, no text beyond region labels.

---

## 9. App Store / Play Store — App Icon

**Path:** `public/icons/app-icon-1024.png`
**Aspect Ratio:** `1:1` (1024×1024) — required size for App Store submission
**Where it's used:** mobile/assets/images/icon.png + App Store listing

> A minimalist, premium app icon: a glowing translucent peptide molecule (3 interlinked spheres) in neon cyan-to-purple gradient, centered on a deep navy rounded-square background with subtle radial glow. No text. No outer device frame, just the flat 1024x1024 icon canvas. Apple-style premium app icon, 8K, photoreal but iconic.

---

## 10. App Store / Play Store — Marketing Banner

**Path:** `public/store/feature-graphic-1024x500.png` (Play Store) and `public/store/app-store-banner-1920x1080.png`
**Aspect Ratio:** Play Store needs `1024x500`. App Store hero banner `1920x1080`.
**Where it's used:** Apple App Store + Google Play Store listings

> A premium horizontal banner showing a floating iPhone (back angle, 3/4 perspective) displaying the Peptide Atlas dashboard, against a dark navy backdrop with neon cyan particle streams flowing past. To the left, large white sans-serif headline "Your peptide intelligence, in your pocket." with a smaller cyan tagline below: "AI · Journal · Bloodwork · Body Map". Glassmorphism, depth-of-field bokeh, premium biotech aesthetic. 8K render, no extra logos.

---

## 11. Open Graph / Social Share

**Path:** `public/og/og-default.png`
**Aspect Ratio:** `1.91:1` (1200×630) — the OpenGraph standard
**Where it's used:** social share preview for Twitter/Discord/iMessage links

> A dark navy banner with a centered glowing peptide molecule (cyan-purple gradient), soft particle drift, and large white sans-serif headline "PeptideAtlas" with cyan subtitle "The peptide reference, personalized to you." Subtle hex grid background. Premium biotech, 8K render.

---

## 12. About / Team / Trust Section (optional)

**Path:** `public/about/lab-aesthetic.png`
**Aspect Ratio:** `16:9` (1920×1080)
**Where it's used:** any future About / Trust / Methodology page

> A modern biotech research lab — sleek glass workstations, holographic data visualizations floating above desks, dim lighting with neon cyan and purple accent strips along the floor. No people, no faces. Apple-store-meets-research-lab aesthetic. 8K cinematic render.

---

## File Drop Instructions

When you have your zip from Higgsfield:

1. Unzip into `~/Downloads/peptide-atlas-images/`
2. Drag-drop into the corresponding `public/` paths above (create subdirectories as needed):
   - `public/hero/`
   - `public/mobile/`
   - `public/features/`
   - `public/store/`
   - `public/og/`
   - `public/about/`
3. Tell Claude "images are in /public" — Claude will wire them into the components and verify in the browser.

## Aspect Ratio Cheat Sheet

| Use | Ratio | Pixels |
|---|---|---|
| Hero / banner | 16:9 | 1920×1080 |
| Ultrawide hero | 21:9 | 2560×1080 |
| iPhone screen | 9:19 | 1170×2470 |
| Square (icon, body map) | 1:1 | 1024×1024 or 1600×1600 |
| Feature illo | 4:3 | 1600×1200 |
| OG share | 1.91:1 | 1200×630 |
| Play Store feature | ~2:1 | 1024×500 |
