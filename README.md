# Next Turbo Starter

A clean, modern, production-ready monorepo template built with **Turborepo**, **Next.js**, **Bun**, **Fumadocs**, **Biome**, and **shadcn/ui**.

Clone it and start building immediately.

## ✨ Features

- ⚡ **Turborepo** — Incremental builds, parallel execution, smart caching
- 🚀 **Next.js 16** — App Router, React Compiler, Server Components, React 19
- 📦 **Bun** — Fast runtime and package manager
- 🎨 **shadcn/ui** — Accessible component library shared across apps
- 📝 **Fumadocs** — Beautiful documentation site with MDX
- 🔧 **Biome** — Unified linting and formatting
- 🪝 **Husky + lint-staged** — Pre-commit quality gates
- 📏 **Commitlint** — Conventional commit enforcement

## 📁 Project Structure

```
next-turbo-starter/
├── apps/
│   ├── web/                  # Main Next.js application (port 3000)
│   └── docs/                 # Documentation site — Fumadocs (port 3001)
├── packages/
│   ├── ui/                   # Shared React components (shadcn/ui)
│   ├── biome-config/         # Shared Biome configuration
│   └── typescript-config/    # Shared TypeScript presets
├── turbo.json                # Turborepo task pipelines
├── biome.json                # Root Biome config
└── package.json              # Workspace root
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- [Node.js](https://nodejs.org) v18+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/next-turbo-starter.git
cd next-turbo-starter

# Install dependencies
bun install

# Start development
bun dev
```

Both apps will be available:
- **Web app:** http://localhost:3000
- **Docs:** http://localhost:3001

### Run a single app

```bash
bunx turbo run dev --filter=web
bunx turbo run dev --filter=docs
```

## 📜 Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `bun dev`            | Start all apps in development mode       |
| `bun run build`      | Build all apps and packages              |
| `bun run lint`       | Lint all code with Biome                 |
| `bun run format`     | Format all code with Biome               |
| `bun run typecheck`  | Run TypeScript type checking             |

## 🎨 Using the UI Package

Components from `@repo/ui` are shared across all apps:

```tsx
import { Button } from "@repo/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
```

Add new shadcn/ui components:

```bash
cd packages/ui
bunx shadcn@latest add <component-name>
```

## 🌍 Environment Variables

Environment files live inside each app (not at the root):

```bash
# apps/docs/.env.local
NEXT_PUBLIC_SITE_URL=https://docs.example.com
NEXT_PUBLIC_GITHUB_REPO=your-username/next-turbo-starter
```

See `apps/docs/.env.example` for all available variables.

## 🚢 Deployment

### Vercel (Recommended)

Each app can be deployed as a separate Vercel project. Set the **Root Directory** to `apps/web` or `apps/docs` in your Vercel project settings.

### Other Platforms

Build the apps with:

```bash
bun run build
```

The output will be in each app's `.next/` directory.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

[MIT](./LICENSE)
