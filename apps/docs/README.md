# Docs App

Documentation site powered by [Fumadocs](https://fumadocs.dev) + Next.js.

## Development

```bash
# From monorepo root
bun dev

# Or run only this app
bunx turbo run dev --filter=docs
```

Open [http://localhost:3001](http://localhost:3001).

## Writing Documentation

Add MDX files to `content/docs/`:

```mdx
---
title: My Page
description: A short description.
---

Your content here.
```

Update `content/docs/meta.json` to control page ordering.

## Environment Variables

See `.env.example` for available variables.
