import Link from "next/link";

import { MEAL_TYPE_OPTIONS } from "../../../../modules/meal-entry/ui/meal_type_options";

export default function MealTypePage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <Link
            className="w-fit text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            href="/"
          >
            ← PakuLog
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
              Meal entry
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-emerald-950">
              どの食事を記録しますか？
            </h1>
            <p className="leading-7 text-slate-600">今から入力する食事の種類を選んでください。</p>
          </div>
        </header>

        <nav aria-label="食事の種類" className="grid gap-3 sm:grid-cols-2">
          {MEAL_TYPE_OPTIONS.map((option) => (
            <Link
              aria-label={option.label}
              className="rounded-3xl border border-emerald-950/10 bg-white/80 p-5 shadow-sm transition hover:border-emerald-700/30 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
              href={`/meals/new?mealType=${option.value}`}
              key={option.value}
            >
              <span className="block text-lg font-semibold text-emerald-950">{option.label}</span>
              <span className="mt-1 block text-sm text-slate-600">{option.description}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
