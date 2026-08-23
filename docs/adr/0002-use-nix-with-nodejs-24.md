# ADR-0002: Use Nix with Node.js 24

- Status: Accepted
- Date: 2026-08-24

In the context of a TypeScript application developed on macOS and verified on Linux CI, facing
host runtime drift and outdated template defaults, we decided for a committed Nix flake and
lockfile providing Node.js 24 and pnpm and against host-only nvm, an unlocked flake, or an
outdated runtime, to make local and CI toolchains reproducible on the current LTS runtime,
accepting Nix and direnv as development prerequisites.
