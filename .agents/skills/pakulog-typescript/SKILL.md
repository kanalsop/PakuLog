---
name: pakulog-typescript
description: >
  PakuLog TypeScript and Next.js conventions for planning, writing, reviewing, linting, or testing
  TS/TSX, React, App Router, Vitest, Playwright, and Supabase integration. Do not load for
  documentation-only or non-TypeScript tasks.
---

# PakuLog TypeScript Development

## Runtime

- Run Node.js and pnpm commands inside the Nix development shell.
- Require Node.js 24 and pnpm 11.21.0 from `/nix/store/` before generating or changing lockfiles.
- Use pnpm exclusively. Do not create npm or Yarn lockfiles.
- Add a dependency only with the feature that uses it, then keep `pnpm knip` green.

## Application Boundaries

- Use Server Components by default. Add `"use client"` only for state, effects, event handlers,
  browser APIs, or client-only libraries, and keep that boundary narrow.
- Keep feature code under `src/features/<feature>/`. Put code in `src/lib/` only when at least two
  features genuinely share it and neither feature owns it.
- Parse untrusted request, form, storage, and recognition output at the boundary. Use Zod once a
  feature needs runtime validation, and infer TypeScript types from schemas instead of duplicating
  interfaces.
- Keep Supabase calls behind feature-owned adapters. Put schema and Row Level Security changes in
  migrations, and test user isolation before exposing user data.
- Model future photo recognition as a replaceable provider that returns reviewable candidates.
  Never persist recognition output without user confirmation. Extract a worker only after actual
  workload or deployment constraints require it.

## Executable Specifications

- Load `tsdd` and follow one Red → Green → Refactor cycle at a time.
- Use `*.test.ts` for pure domain and server behavior in the Node Vitest project.
- Use `*.test.tsx` for synchronous React component behavior in the jsdom Vitest project.
- Use Playwright for routing, responsive behavior, browser APIs, and async Server Components.
- Name each test as a full sentence describing one observable behavior.

## Command Routing

| Change                            | Minimum verification                                        |
| --------------------------------- | ----------------------------------------------------------- |
| One pure TypeScript behavior      | `pnpm test -- <test-file>` and `pnpm typecheck`             |
| React component behavior          | `pnpm test -- <test-file>` and `pnpm lint`                  |
| Route or browser behavior         | focused `pnpm test:e2e` project plus `pnpm typecheck`       |
| Dependency or configuration       | `pnpm check`                                                |
| Pull-request-ready implementation | `pnpm check`; add `pnpm test:e2e` for UI or routing changes |

Before finishing any TypeScript implementation, run `pnpm check`. Run `pnpm check:all` when the
change affects browser-visible behavior. Load `adr` if the change introduces or reverses a broad
architectural choice.
