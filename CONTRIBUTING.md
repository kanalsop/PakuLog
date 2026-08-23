# 開発ガイド

PakuLogへの変更をlocalで開発し，Pull Requestとして提出するための手順です．

## 必要なtool

- Git
- Nix
- direnv
- Chromiumを実行できる環境

Node.jsとpnpmはNix development shellから提供されるため，個別にinstallする必要はありません．

## 初回setup

repositoryをcloneした後，project rootで次を実行します．

```bash
direnv allow
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

`which node`と`which pnpm`が`/nix/store/`配下を指し，`node --version`がv24系であることを確認してください．

## 開発

開発serverを起動します．

```bash
pnpm dev
```

主なcommandは次のとおりです．

| Command          | 用途                                                 |
| ---------------- | ---------------------------------------------------- |
| `pnpm format`    | sourceと設定fileを整形する                           |
| `pnpm lint`      | TypeScript・React・Next.jsを静的解析する             |
| `pnpm typecheck` | TypeScriptの型を検査する                             |
| `pnpm test`      | unit testとcomponent testを実行する                  |
| `pnpm test:e2e`  | desktop・mobile ChromiumでE2E testを実行する         |
| `pnpm check`     | Pull Request前の品質検査とproduction buildを実行する |
| `pnpm check:all` | `pnpm check`にE2E testを加えて実行する               |

Playwrightのbrowserが未installの場合は，次を実行してください．

```bash
pnpm exec playwright install chromium
```

## Supabase

Supabase CLIと`supabase/config.toml`は導入済みですが，local database，schema，migration，seedはまだ整備していません．現段階では`supabase start`を通常の開発手順に含めません．

## Branchとcommit

branch名は`<type>/<kebab-subject>`とします．`type`にはConventional Commitsのtypeを使います．

```text
feat/add-meal-entry
fix/handle-empty-food-name
docs/clarify-development-setup
```

commit messageはConventional Commitsに従い，subjectを英語の命令形で書き，末尾にperiodを付けません．

```text
feat(meals): add meal entry form
fix(nutrition): handle missing nutrient values
docs: clarify development setup
```

## 命名規則

- directoryはlower-caseのkebab-caseにします．
- 通常のsource fileはlower-caseのsnake_caseにします．
- Next.jsの予約file名と慣習的な設定file名は例外です．
- React component，type，classはPascalCaseにします．
- function，variable，propertyはcamelCaseにします．

## Pull Request前の確認

```bash
pnpm check:all
```

変更した振る舞いを説明するtestがあること，秘密情報やlocal環境固有のfileを含めていないこと，architecture上の重要な判断理由がADRへ記録されていることを確認してください．
