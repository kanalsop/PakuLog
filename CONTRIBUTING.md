# 開発ガイド

PakuLogへの変更をlocalで開発し，Pull Requestとして提出するための手順です．

## 必要なtool

- Git
- Nix
- direnv
- Docker
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
| `pnpm test:e2e`  | local Supabaseに対してbrowser E2E testを実行する     |
| `pnpm check`     | Pull Request前の品質検査とproduction buildを実行する |
| `pnpm check:all` | `pnpm check`にE2E testを加えて実行する               |

Playwrightのbrowserが未installの場合は，次を実行してください．

```bash
pnpm exec playwright install chromium
```

## Supabase

Supabase CLI，local database，migration，seed，メール・パスワード認証を利用します．Dockerを起動した状態でlocal Supabaseを開始してください．

```bash
pnpm exec supabase start
```

local SupabaseのURLとpublishable keyをNext.jsへ渡すため，次のcommandで`.env.local`を作成します．

```bash
pnpm exec supabase status -o env \
  --override-name api.url=NEXT_PUBLIC_SUPABASE_URL \
  --override-name auth.publishable_key=NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  | rg '^NEXT_PUBLIC_' > .env.local
```

`supabase/config.toml`では，メール確認なし，8文字以上かつ英字・数字を含むパスワードを設定しています．local環境で送信された認証メールはMailpit（通常は`http://127.0.0.1:54324`）で確認できますが，MVPのアカウント作成では確認メールを使用しません．

hosted SupabaseでもAuthenticationのEmail providerを有効にし，Confirm emailを無効，minimum password lengthを8，password requirementsをletters and digitsへ揃えてください．Project URLとpublishable keyはdeploy先の`NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`へ設定します．

database testとbrowser E2E testはlocal Supabaseの起動中に実行します．作業後は停止できます．

```bash
pnpm test:db
pnpm test:e2e
pnpm exec supabase stop
```

MEXT食品dataを一括importするときだけ，`.env.local`へ`SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`も設定します．service role keyをbrowserへ公開してはいけません．

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
