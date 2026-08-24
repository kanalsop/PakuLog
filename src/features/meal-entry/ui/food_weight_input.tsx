"use client";

import { useEffect, useId, useRef, useState } from "react";

import { parseFoodWeight } from "../domain/food_weight";

const DIGIT_PLACES = [
  { factor: 10_000, label: "千の位" },
  { factor: 1_000, label: "百の位" },
  { factor: 100, label: "十の位" },
  { factor: 10, label: "一の位" },
  { factor: 1, label: "小数第一位" },
] as const;

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);
const WHEEL_DIGITS = [...DIGITS, ...DIGITS, ...DIGITS];
const MIDDLE_CYCLE_OFFSET = DIGITS.length;
const DIGIT_ROW_HEIGHT = 48;

type DigitWheelProps = Readonly<{
  label: string;
  onChange: (digit: number) => void;
  value: number;
}>;

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- A native select cannot provide the cyclic, per-digit wheel interaction. */
function DigitWheel({ label, onChange, value }: DigitWheelProps) {
  const listboxId = useId();
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listboxRef.current) {
      listboxRef.current.scrollTop = (MIDDLE_CYCLE_OFFSET + value) * DIGIT_ROW_HEIGHT;
    }
  }, [value]);

  function selectDigit(nextDigit: number) {
    const wrappedDigit = (nextDigit + DIGITS.length) % DIGITS.length;
    listboxRef.current?.scrollTo({
      behavior: "smooth",
      top: (MIDDLE_CYCLE_OFFSET + wrappedDigit) * DIGIT_ROW_HEIGHT,
    });
    onChange(wrappedDigit);
  }

  return (
    <div
      ref={listboxRef}
      aria-activedescendant={`${listboxId}-digit-${value}`}
      aria-label={label}
      aria-orientation="vertical"
      className="relative z-10 h-60 w-10 snap-y snap-mandatory touch-pan-y overflow-y-auto overscroll-contain rounded-lg text-center outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden sm:w-12"
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          selectDigit(value + (event.key === "ArrowDown" ? 1 : -1));
        }

        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          selectDigit(event.key === "Home" ? 0 : 9);
        }
      }}
      onScroll={(event) => {
        const rowIndex = Math.round(event.currentTarget.scrollTop / DIGIT_ROW_HEIGHT);
        const nextDigit = rowIndex % DIGITS.length;

        if (nextDigit !== value) {
          onChange(nextDigit);
        }
      }}
      role="listbox"
      style={{
        maskImage: "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
      }}
      tabIndex={0}
    >
      <div aria-hidden="true" className="h-24" />
      {WHEEL_DIGITS.map((digit, rowIndex) => {
        const isSemanticOption =
          rowIndex >= MIDDLE_CYCLE_OFFSET && rowIndex < MIDDLE_CYCLE_OFFSET + DIGITS.length;

        return (
          <div
            aria-hidden={isSemanticOption ? undefined : true}
            aria-selected={isSemanticOption ? digit === value : undefined}
            className={`flex h-12 snap-center items-center justify-center tabular-nums transition-[color,font-weight,opacity] ${
              digit === value
                ? "text-3xl font-semibold text-emerald-950"
                : "text-2xl font-medium text-slate-400"
            }`}
            id={isSemanticOption ? `${listboxId}-digit-${digit}` : undefined}
            key={rowIndex}
            role={isSemanticOption ? "option" : undefined}
          >
            {digit}
          </div>
        );
      })}
      <div aria-hidden="true" className="h-24" />
    </div>
  );
}
/* oxlint-enable jsx-a11y/prefer-tag-over-role */

type FoodWeightInputProps = Readonly<{
  defaultDecigrams?: number;
  name: string;
}>;

export function FoodWeightInput({ defaultDecigrams = 1_000, name }: FoodWeightInputProps) {
  const [decigrams, setDecigrams] = useState(defaultDecigrams);
  const errorMessageId = useId();
  const isZero = decigrams === 0;

  function changeDigit(factor: number, nextDigit: number) {
    setDecigrams((currentDecigrams) => {
      const currentDigit = Math.floor(currentDecigrams / factor) % 10;
      return currentDecigrams + (nextDigit - currentDigit) * factor;
    });
  }

  return (
    <fieldset className="rounded-3xl border border-emerald-950/10 bg-white/80 p-5 shadow-sm">
      <legend className="px-2 text-sm font-semibold text-emerald-950">摂取量</legend>

      <p className="text-center text-xs text-slate-500">各桁を上下にスクロール</p>
      <div
        className="relative mt-2 flex h-60 items-center justify-center gap-1 sm:gap-2"
        aria-label="桁別の摂取量ホイール"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 rounded-xl bg-emerald-50 ring-1 ring-inset ring-emerald-900/10"
        />
        {DIGIT_PLACES.map(({ factor, label }, index) => {
          const digit = Math.floor(decigrams / factor) % 10;

          return (
            <div key={factor} className="contents">
              {index === DIGIT_PLACES.length - 1 ? (
                <span
                  className="relative z-10 text-3xl font-semibold text-emerald-950"
                  aria-hidden="true"
                >
                  .
                </span>
              ) : null}
              <DigitWheel
                label={label}
                onChange={(nextDigit) => changeDigit(factor, nextDigit)}
                value={digit}
              />
            </div>
          );
        })}
        <span className="relative z-10 text-lg font-medium text-slate-600">g</span>
      </div>

      <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-slate-700">
        数値で入力
        <div className="flex items-center gap-2">
          <input
            aria-describedby={isZero ? errorMessageId : undefined}
            aria-invalid={isZero}
            aria-label="摂取量"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-right tabular-nums"
            inputMode="decimal"
            max="9999.9"
            min="0.1"
            name={name}
            onChange={(event) => {
              const parsedWeight = parseFoodWeight(event.currentTarget.value);

              if (parsedWeight.success) {
                setDecigrams(parsedWeight.value.decigrams);
              }
            }}
            step="0.1"
            type="number"
            value={(decigrams / 10).toFixed(1)}
          />
          <span aria-hidden="true">g</span>
        </div>
      </label>
      {isZero ? (
        <p id={errorMessageId} role="alert" className="mt-2 text-sm font-medium text-red-700">
          0.1 g以上を設定してください
        </p>
      ) : null}
    </fieldset>
  );
}
