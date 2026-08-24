import Link from "next/link";

import { FoodWeightInput } from "../../../modules/meal-entry/ui/food_weight_input";

export default function NewMealPage() {
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
            <h1 className="text-4xl font-semibold tracking-tight text-emerald-950">食事を記録</h1>
            <p className="leading-7 text-slate-600">
              各桁を動かして、食べた量をすばやく設定できます。
            </p>
          </div>
        </header>

        <FoodWeightInput defaultDecigrams={1_000} name="foodWeightGrams" />
      </div>
    </main>
  );
}
