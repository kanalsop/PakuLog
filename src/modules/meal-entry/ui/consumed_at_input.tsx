"use client";

import { useId, useState } from "react";

import { getJstDate, parseJstConsumedAt } from "../domain/consumed_at";

type ConsumedAtInputProps = Readonly<{
  dateName: string;
  timeName: string;
}>;

export function ConsumedAtInput({ dateName, timeName }: ConsumedAtInputProps) {
  const dateInputId = useId();
  const timeInputId = useId();
  const errorMessageId = useId();
  const [consumedOn, setConsumedOn] = useState(() => getJstDate(new Date()));
  const [consumedTime, setConsumedTime] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const isDateInvalid =
    hasInteracted && !parseJstConsumedAt({ consumedOn, consumedTime: "" }).success;

  return (
    <fieldset className="rounded-3xl border border-emerald-950/10 bg-white/80 p-5 shadow-sm">
      <legend className="px-2 text-sm font-semibold text-emerald-950">摂取日時</legend>
      <p className="text-sm leading-6 text-slate-600">時刻は記録したい場合だけ設定できます。</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label
          className="flex flex-col gap-2 text-sm font-medium text-slate-700"
          htmlFor={dateInputId}
        >
          摂取日
          <input
            aria-describedby={isDateInvalid ? errorMessageId : undefined}
            aria-invalid={isDateInvalid}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums"
            id={dateInputId}
            name={dateName}
            onChange={(event) => {
              setConsumedOn(event.currentTarget.value);
              setHasInteracted(true);
            }}
            required
            type="date"
            value={consumedOn}
          />
        </label>
        <label
          className="flex flex-col gap-2 text-sm font-medium text-slate-700"
          htmlFor={timeInputId}
        >
          摂取時刻（任意）
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums"
            id={timeInputId}
            name={timeName}
            onChange={(event) => {
              setConsumedTime(event.currentTarget.value);
              setHasInteracted(true);
            }}
            step="60"
            type="time"
            value={consumedTime}
          />
        </label>
      </div>
      {isDateInvalid ? (
        <p className="mt-3 text-sm font-medium text-red-700" id={errorMessageId} role="alert">
          正しい摂取日を入力してください
        </p>
      ) : null}
    </fieldset>
  );
}
