# Blog System

PeptideAtlas includes a blog system for educational peptide articles. Posts are written in MDX format, stored as files, and rendered server-side.

## Overview

- **Content location:** `content/blog/*.mdx`
- **Index page:** `/learn` (with search and category filtering)
- **Post pages:** `/learn/[slug]` (dynamic route)
- **Utilities:** `src/lib/blog.ts`
- **Custom components:** `src/components/blog/mdx-components.tsx`
- **Rendering:** `next-mdx-remote/rsc` (server-side)
- **Frontmatter parsing:** `gray-matter`
- **Reading time:** `reading-time` package

## Existing Blog Posts

| Filename | Topic |
|----------|-------|
| `bpc-157-complete-guide.mdx` | Comprehensive BPC-157 guide |
| `growth-hormone-peptides-explained.mdx` | Growth hormone peptide overview |
| `healing-peptides-for-recovery.mdx` | Healing peptides for recovery |
| `peptide-safety-what-to-know.mdx` | Safety considerations |
| `peptide-stacking-guide.mdx` | Guide to stacking peptides |

## MDX File Format

Each blog post is an MDX file with YAML frontmatter at the top:

```mdx
---
title: "Your Post Title"
date: "2024-12-15"
category: "Education"
excerpt: "A short summary of what this post covers, shown on blog cards."
author: "PeptideAtlas Team"
tags:
  - peptides
  - healing
  - BPC-157
coverImage: "/images/blog/your-image.jpg"
---

Your MDX content starts here. You can use standard Markdown plus custom components.

## Section Heading

Regular paragraph text with **bold** and *italic* formatting.

<Callout type="tip">
  This is a tip callout box.
</Callout>

Check out <PeptideLink slug="bpc-157">BPC-157</PeptideLink> for more details.
```

### Frontmatter Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Post title displayed on the page and in cards |
| `date` | `string` | Yes | Publication date in `YYYY-MM-DD` format |
| `category` | `string` | Yes | Category for filtering (e.g., `"Education"`, `"Guide"`, `"Safety"`) |
| `excerpt` | `string` | Yes | 1-2 sentence summary for blog cards and SEO |
| `author` | `string` | No | Defaults to `"PeptideAtlas Team"` |
| `tags` | `string[]` | Yes | Array of tags for filtering and display |
| `coverImage` | `string` | No | Path to cover image (relative to `public/`) |

The `readingTime` field is calculated automatically by the `reading-time` package and added to the post metadata.

## How to Create a New Blog Post

### Step 1: Create the MDX file

Create a new file at `content/blog/your-slug.mdx`. The filename (without `.mdx`) becomes the URL slug.

```
content/blog/your-new-post.mdx  -->  /learn/your-new-post
```

### Step 2: Add frontmatter

Add the YAML frontmatter block at the top of the file (see format above). All required fields must be present.

### Step 3: Write content

Write your content using standard Markdown syntax plus the custom MDX components listed below. The content supports:

- Headings (h1-h3)
- Paragraphs, bold, italic
- Ordered and unordered lists
- Blockquotes
- Code blocks and inline code
- Tables
- Horizontal rules
- Links (internal and external)
- Custom components (`Callout`, `PeptideLink`)

### Step 4: Verify

The post will automatically:
- Appear on the `/learn` blog index page
- Generate a page at `/learn/your-slug`
- Be included in the sitemap (`sitemap.xml`)
- Calculate reading time

No build configuration changes are needed.

## Blog Utility Functions

**File:** `src/lib/blog.ts`

| Function | Returns | Description |
|----------|---------|-------------|
| `getAllPosts()` | `BlogPostMeta[]` | All posts sorted by date (newest first), without content body |
| `getPostBySlug(slug)` | `BlogPost \| null` | Full post including content, or null if not found |
| `getPostSlugs()` | `string[]` | All available slugs (for `generateStaticParams`) |
| `getLatestPosts(count)` | `BlogPostMeta[]` | First N posts by date |
| `getAllTags()` | `string[]` | All unique tags across all posts, sorted |
| `getAllCategories()` | `string[]` | All unique categories, sorted |

### How posts are parsed

The `parseMdxFile()` internal function:

1. Reads the `.mdx` file from disk using `fs.readFileSync`
2. Parses frontmatter with `gray-matter` (separates YAML header from content)
3. Calculates reading time with the `reading-time` package
4. Returns a `BlogPost` object with all frontmatter fields plus `content` (raw MDX string) and `readingTime`

Posts are read from `content/blog/` relative to `process.cwd()`.

## Custom MDX Components

**File:** `src/components/blog/mdx-components.tsx`

### `Callout`

A styled callout/alert box with colored left border.

```mdx
<Callout type="info">
  This is informational content.
</Callout>

<Callout type="warning">
  Important safety consideration.
</Callout>

<Callout type="tip">
  Helpful tip for the reader.
</Callout>
```

| Type | Border Color | Background |
|------|-------------|------------|
| `info` | Cyan (`#00d4ff`) | Cyan 4% opacity |
| `warning` | Orange (`#ff6b35`) | Orange 4% opacity |
| `tip` | Green (`#00ff88`) | Green 4% opacity |

### `PeptideLink`

An inline link to a peptide detail page, styled as a small cyan pill.

```mdx
Learn about <PeptideLink slug="bpc-157">BPC-157</PeptideLink> and its effects.
```

Renders as: A clickable inline element linking to `/atlas/peptides/bpc-157` with cyan background tint.

### Styled HTML Elements

All standard HTML elements are restyled for the dark theme:

| Element | Styling |
|---------|---------|
| `h1` | 3xl bold white, mt-10 mb-6, scroll-mt-24 |
| `h2` | 2xl semibold white, mt-8 mb-4, scroll-mt-24 |
| `h3` | xl semibold white/90, mt-6 mb-3, scroll-mt-24 |
| `p` | Relaxed leading, white/60 |
| `a` | Cyan color, underline on hover |
| `ul` / `ol` | White/60 text, cyan markers, ml-6 |
| `blockquote` | Cyan left border, white/50 italic, subtle background |
| `code` (inline) | White/5 background, cyan text, rounded |
| `pre` (code block) | Dark background (#0d1117), rounded, overflow-x-auto |
| `table` | Full width, white/60 text |
| `th` | Semibold white, bottom border |
| `td` | Subtle bottom border |
| `hr` | White/6 border |
| `strong` | Semibold white |

## Rendering Pipeline

```
content/blog/your-post.mdx
  │
  ├── gray-matter: Extract frontmatter + content
  ├── reading-time: Calculate reading time
  │
  └── next-mdx-remote/rsc: Server-side render
        │
        ├── MDX content compiled to React components
        ├── Custom components mapped (Callout, PeptideLink, styled elements)
        ├── rehype-slug: Add IDs to headings
        └── rehype-autolink-headings: Add anchor links to headings
              │
              └── Rendered HTML in dark-themed layout
```

The rendering happens entirely on the server (`next-mdx-remote/rsc`), so blog posts are statically generated at build time with no client-side JavaScript needed for the content itself.

## Blog Index Page

The `/learn` page (`src/app/(marketing)/learn/page.tsx`) displays:

1. Page header with title and description
2. Search input (filters posts by title and excerpt)
3. Category filter tags
4. Grid of `BlogCard` components showing:
   - Title
   - Excerpt
   - Category badge
   - Author
   - Date
   - Reading time
   - Tags
5. Each card links to `/learn/[slug]`

## SEO

### Metadata Generation

Blog post pages generate metadata dynamically:
- **Title:** Post title (appended with `| PeptideAtlas` via template)
- **Description:** Post excerpt

### Sitemap

All blog post URLs are automatically included in `sitemap.xml` (generated by `src/app/sitemap.ts`), which calls `getPostSlugs()` to enumerate all posts.

### OpenGraph

Blog posts can include OpenGraph metadata for social sharing:
- Title from frontmatter
- Description from excerpt
- Image from `coverImage` (if provided)
