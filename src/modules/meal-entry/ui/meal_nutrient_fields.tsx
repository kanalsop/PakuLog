"use client";

import { useEffect, useRef, useState } from "react";

import { parseFoodNutrientProfileResponse } from "../application/food_nutrient_profile";
import { type FoodSearchResult } from "../application/food_search_result";
import {
  calculateMealNutrients,
  formatMealNutrientAmount,
  MEAL_NUTRIENT_DEFINITIONS,
  type FoodNutrient,
} from "../domain/meal_nutrients";
import { FoodSearchInput } from "./food_search_input";
import { FoodWeightInput } from "./food_weight_input";

type MealNutrientFieldsProps = Readonly<{
  defaultDecigrams?: number;
  foodIdName: string;
  weightName: string;
}>;

export function MealNutrientFields({
  defaultDecigrams = 1_000,
  foodIdName,
  weightName,
}: MealNutrientFieldsProps) {
  const [decigrams, setDecigrams] = useState(defaultDecigrams);
  const [nutrients, setNutrients] = useState<FoodNutrient[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    [],
  );

  async function selectFood(food: FoodSearchResult) {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setNutrients(null);
    setStatus("loading");

    try {
      const response = await fetch(`/api/foods/${food.id}/nutrients`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("食品栄養値を取得できませんでした");
      }

      const profile = parseFoodNutrientProfileResponse(await response.json());

      if (!controller.signal.aborted) {
        setNutrients(profile);
        setStatus("idle");
      }
    } catch {
      if (!controller.signal.aborted) {
        setNutrients(null);
        setStatus("error");
      }
    }
  }

  const calculatedNutrients =
    nutrients && decigrams > 0 ? calculateMealNutrients(nutrients, decigrams) : null;

  return (
    <>
      <FoodSearchInput name={foodIdName} onSelect={(food) => void selectFood(food)} />
      <FoodWeightInput
        defaultDecigrams={defaultDecigrams}
        name={weightName}
        onDecigramsChange={setDecigrams}
      />

      {status === "loading" ? (
        <output className="text-sm font-medium text-slate-600">栄養価を読み込んでいます</output>
      ) : null}

      {status === "error" ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          食品の栄養価を取得できませんでした。食品を選び直してください。
        </p>
      ) : null}

      {calculatedNutrients ? (
        <section className="rounded-3xl border border-emerald-950/10 bg-white/80 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-950">この食事の栄養価</h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {MEAL_NUTRIENT_DEFINITIONS.map(({ nutrientCode, label, unit }, index) => {
                const nutrient = calculatedNutrients[index];

                if (!nutrient || nutrient.nutrientCode !== nutrientCode) {
                  return null;
                }

                const amount = formatMealNutrientAmount(nutrient);

                return (
                  <tr
                    className="border-t border-emerald-950/10 first:border-t-0"
                    key={nutrientCode}
                  >
                    <th className="py-3 text-left font-medium text-slate-700" scope="row">
                      {label}
                    </th>
                    <td className="py-3 text-right font-semibold tabular-nums text-emerald-950">
                      {amount === "ー" ? amount : `${amount} ${unit}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}
    </>
  );
}
