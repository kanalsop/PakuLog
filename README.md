# PakuLog

毎日の食事を手軽に記録し，栄養の過不足を分かりやすく把握するための個人開発Webアプリです．

公開時のdomainは`pakulog.kananet.uk`を候補としています．

## コンセプト

PakuLogは，subscriptionに依存せず，自分の食事と栄養dataを自分で管理できることを目指しています．

毎日無理なく続けられる記録の手軽さと，栄養状態をひと目で理解できる分かりやすさを大切にします．

## 解決したい課題

- 毎回の食事記録に時間や手間がかかる
- 摂取した栄養素が不足しているのか，適正なのか，過剰なのか分かりにくい
- 端末が変わると食事記録を確認・更新しにくい

## 主な機能（予定）

- accountによる複数端末間のdata同期
- 食品名と摂取量の文字入力
- 食事記録の追加・編集
- 日ごとのenergy・栄養素の集計
- 摂取量と目標範囲を比較できるgraph
- 過去の食事記録の閲覧

## 対象

日々の食生活を振り返り，栄養balanceを把握したい成人を主な対象としています．

PakuLogは一般的な健康管理を支援するものであり，疾病の診断・治療・予防などの医療目的での利用は想定していません．

## 現在のstatus

現在は企画・MVP設計段階です．まずは，食事を短時間で記録し，その日の栄養素の過不足を確認できる体験の実現を目指します．

## 技術stack

以下は採用予定を含む構成です．現時点ではNext.js基盤とtest・品質管理toolを導入し，feature向けlibraryは実際に利用する段階で追加します．

| 分類                     | 技術                                     |
| ------------------------ | ---------------------------------------- |
| Web application          | Next.js（App Router），React，TypeScript |
| Styling・UI              | Tailwind CSS，shadcn/ui                  |
| Form・入力検証           | React Hook Form，Zod                     |
| Graph                    | Recharts                                 |
| Database                 | Supabase PostgreSQL                      |
| Authentication・画像保存 | Supabase Auth，Supabase Storage          |
| Test                     | Vitest，Testing Library，Playwright      |
| Hosting                  | Vercel，Supabase                         |

TypeScriptをapplication全体の中心に据え，frontend，server処理，入力検証で共通の型を利用します．userごとのdataは，SupabaseのRow Level Securityを使って分離します．

まずは単一のNext.js applicationとして開発し，featureごとにcodeを分割します．将来の写真認識は交換可能な認識moduleとして追加し，必要になった段階でAI処理だけを独立したworkerへ分離できる構成を目指します．

## 将来構想

- 最近使った食品や過去の食事の再利用
- user独自の食品・recipeの登録
- 自由文による複数食品の一括入力
- 体重や栄養摂取量の長期的な推移の可視化
