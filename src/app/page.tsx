import Link from "next/link";

const FEATURES = [
  {
    title: "記録する",
    description: "食品名と摂取量から，その日の食事をすばやく残します．",
  },
  {
    title: "振り返る",
    description: "栄養素の過不足を，目標範囲と比較して分かりやすく確認します．",
  },
  {
    title: "続ける",
    description: "端末をまたいで記録を共有し，日々の変化を積み重ねます．",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
        <header className="flex flex-col gap-6">
          <p className="text-sm font-semibold tracking-[0.24em] text-emerald-700 uppercase">
            Nutrition journal
          </p>
          <div className="flex max-w-3xl flex-col gap-5">
            <h1 className="text-5xl font-semibold tracking-tight text-emerald-950 sm:text-7xl">
              PakuLog
            </h1>
            <p className="text-2xl leading-relaxed font-medium text-emerald-900 sm:text-3xl">
              毎日の食事を，無理なく記録．
            </p>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              食べたものを手軽に残し，栄養状態をひと目で振り返るための個人開発Webアプリです．
            </p>
            <Link
              className="w-fit rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
              href="/meals/new"
            >
              食事を記録する
            </Link>
          </div>
        </header>

        <section aria-labelledby="features-title" className="flex flex-col gap-6">
          <h2 id="features-title" className="text-sm font-semibold tracking-wider text-slate-500">
            目指す体験
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-emerald-950/10 bg-white/70 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-emerald-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
