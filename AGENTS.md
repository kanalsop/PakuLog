# PakuLog Agent Guide

PakuLog is a personal nutrition journal for recording meals and understanding daily nutrient
balance. The repository and package use the internal name NutriLog. The product is for everyday
health management, not diagnosis, treatment, or prevention of disease.

## Repository Map

- `src/app/` — Next.js App Router entry points and UI.
- `src/features/` — feature-owned domain, application, and UI code when features are added.
- `src/lib/` — narrow shared infrastructure with no feature ownership.
- `tests/e2e/` — browser-level executable specifications.
- `supabase/` — Supabase CLI configuration and future database migrations.
- `docs/adr/` — architectural decisions; read only the ADRs relevant to the current task.
- `.agents/skills/` — task-specific development workflows and conventions.
- `.codex/` — minimal Codex project configuration.

## Required Workflow

- Follow Red → Green → Refactor, one executable specification at a time. Load `tsdd` before
  production code or tests. Production behavior without a failing-then-passing test is a defect.
- Load `nutrilog-typescript` before planning, writing, reviewing, or testing TypeScript, TSX,
  Next.js, React, Playwright, Vitest, or Supabase integration.
- Load `nix-dev-init` before changing the project development shell or language toolchain.
- Load `adr` for broad decisions or reversals, and record the decision with the implementation.
- Load `gha-style` before changing GitHub Actions.
- Load `git-workflow` before implementation or Git operations. Codex branches use
  `codex/<type>/<kebab-subject>`.
- Load `git-commit-split` only when the user explicitly asks to split pending changes or create
  one branch and pull request per feature.

## Invariants

- Node.js 24 and pnpm run through the Nix development shell. Do not generate lockfiles with a host
  runtime.
- Tests are the durable specification, code and types carry implementation, ADRs carry broad Why,
  and comments carry only local Why.
- Keep Server Components as the default and introduce Client Components only at interactive or
  browser-only boundaries.
- Treat all external input as untrusted and parse it at the boundary before it reaches domain code.
- Keep user data isolation enforceable by Supabase Row Level Security when database work begins.
- Do not add durable planning documents that duplicate tests or code.
- Do not add dependencies, services, or infrastructure before a concrete feature needs them.
- Do not commit, push, open a pull request, or modify remote state unless the user explicitly asks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
