---
name: nix-dev-init
description: >
  PakuLog project development-shell conventions. Load when planning, writing, reviewing, or
  troubleshooting flake.nix, flake.lock, .envrc, direnv, Node.js or pnpm version pinning, Nix
  devShell packages, or Linux CI evaluation of the flake. Do not load for ordinary TypeScript work.
---

# PakuLog Nix Development Environment

## Invariants

- Treat `flake.nix` and `flake.lock` as the source of truth for the development toolchain.
- Provide Node.js 24, pnpm 11.21.0, nixfmt, statix, and deadnix from the devShell.
- Keep `aarch64-darwin` for local development and `x86_64-linux` for CI.
- Keep `.envrc` minimal: `use flake` only. Put local secrets in ignored environment files.
- Commit `flake.lock`. Never regenerate `pnpm-lock.yaml` with a host Node.js or pnpm binary.
- Keep editor-only language servers out of the project shell unless a concrete incompatibility
  requires a project pin.

## Change Workflow

1. Load `tsdd` before changing this durable project configuration.
2. State the environment behavior being preserved or changed.
3. Edit the smallest relevant Nix, direnv, package, or CI surface.
4. Enter the shell with `direnv allow` or `nix develop path:.`.
5. Verify both executables resolve below `/nix/store/`:
   - `node --version` reports a `v24` release.
   - `pnpm --version` reports `11.21.0`.
6. Run the verification commands below.
7. Load `adr` if the change replaces the runtime, package manager, supported systems, or lockfile
   policy.

## Verification

Run inside the project root:

```text
nix develop path:. --command nixfmt --check flake.nix
nix develop path:. --command statix check .
nix develop path:. --command deadnix --fail .
nix flake check --all-systems path:.
nix develop path:. --command pnpm install --frozen-lockfile
```

After toolchain changes, run `pnpm check` from the activated shell. Add `pnpm test:e2e` when the
change can affect browser execution.

## Prohibited Shortcuts

- Do not add Node.js or pnpm to a global dotfiles environment to satisfy this repository.
- Do not hand-edit `.direnv/` or Nix store paths.
- Do not leave an unlocked Nix input or use a floating host toolchain.
- Do not mix npm, Yarn, or Bun lockfiles into the pnpm project.
- Do not broaden supported systems without a concrete local or CI consumer.
