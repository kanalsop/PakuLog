"use client";

import { FormEvent, useId, useState } from "react";

import { parseFoodSearchResults, type FoodSearchResult } from "../application/food_search_result";

type FoodSearchInputProps = Readonly<{
  name: string;
  onSelect?: (food: FoodSearchResult) => void;
}>;

function formatFoodName(food: FoodSearchResult): string {
  return food.descriptors.length > 0 ? `${food.name}（${food.descriptors.join("・")}）` : food.name;
}

export function FoodSearchInput({ name, onSelect }: FoodSearchInputProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`/api/foods?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error("食品を検索できませんでした");
      }

      setResults(parseFoodSearchResults(await response.json()));
      setStatus("idle");
    } catch {
      setResults([]);
      setStatus("error");
    }
  }

  return (
    <section className="rounded-3xl border border-emerald-950/10 bg-white/80 p-5 shadow-sm">
      <search>
        <form className="flex flex-col gap-3" onSubmit={(event) => void submitSearch(event)}>
          <label className="text-sm font-semibold text-emerald-950" htmlFor={inputId}>
            食品名
          </label>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2"
              id={inputId}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="例: サンマ"
              type="search"
              value={query}
            />
            <button
              className="rounded-xl bg-emerald-800 px-5 py-2 font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
              disabled={status === "loading"}
              type="submit"
            >
              {status === "loading" ? "検索中" : "検索"}
            </button>
          </div>
        </form>
      </search>

      {status === "error" ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          食品を検索できませんでした。時間をおいて再度お試しください。
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul
          aria-label="食品の検索結果"
          className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1"
        >
          {results.map((food) => (
            <li key={food.id}>
              <button
                aria-label={formatFoodName(food)}
                className="w-full rounded-xl border border-emerald-950/10 bg-white px-4 py-3 text-left hover:bg-emerald-50"
                onClick={() => {
                  setSelectedFood(food);
                  onSelect?.(food);
                }}
                type="button"
              >
                <span className="block font-semibold text-emerald-950">{formatFoodName(food)}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {food.categoryPath.join(" / ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        data-testid="selected-food-id"
        name={name}
        type="hidden"
        value={selectedFood?.id ?? ""}
      />
      {selectedFood ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">
          選択中: {formatFoodName(selectedFood)}
        </p>
      ) : null}
    </section>
  );
}
