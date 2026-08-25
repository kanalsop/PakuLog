import type { MealType } from "../domain/meal_type";
import { MEAL_TYPE_OPTIONS } from "./meal_type_options";

type MealTypeInputProps = Readonly<{
  defaultValue: MealType;
  name: string;
}>;

export function MealTypeInput({ defaultValue, name }: MealTypeInputProps) {
  return (
    <fieldset className="rounded-3xl border border-emerald-950/10 bg-white/80 p-5 shadow-sm">
      <legend className="px-2 text-sm font-semibold text-emerald-950">食事の種類</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MEAL_TYPE_OPTIONS.map((option) => (
          <label
            className="has-checked:border-emerald-700 has-checked:bg-emerald-50 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 has-checked:text-emerald-950"
            key={option.value}
          >
            <input
              className="sr-only"
              defaultChecked={option.value === defaultValue}
              name={name}
              required
              type="radio"
              value={option.value}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
