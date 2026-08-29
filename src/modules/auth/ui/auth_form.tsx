"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type AuthFormState } from "../application/submit_auth";
import { signInAction, signUpAction } from "./auth_actions";

interface AuthFormProperties {
  mode: "signIn" | "signUp";
  nextPath: string;
}

const INITIAL_STATE: AuthFormState = {};

export function AuthForm({ mode, nextPath }: AuthFormProperties) {
  const isSignUp = mode === "signUp";
  const [state, formAction, pending] = useActionState(
    isSignUp ? signUpAction : signInAction,
    INITIAL_STATE,
  );
  const alternatePath = `${isSignUp ? "/login" : "/signup"}?${new URLSearchParams({ next: nextPath })}`;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input name="next" type="hidden" value={nextPath} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-emerald-950" htmlFor="email">
          メールアドレス
        </label>
        <input
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          autoComplete="email"
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          defaultValue={state.email}
          id="email"
          name="email"
          required
          type="email"
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-red-700" id="email-error">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-emerald-950" htmlFor="password">
          パスワード
        </label>
        <input
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          id="password"
          minLength={8}
          name="password"
          pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
          required
          type="password"
        />
        {isSignUp && !state.fieldErrors?.password && (
          <p className="text-sm text-slate-500">8文字以上で、英字と数字を含めてください</p>
        )}
        {state.fieldErrors?.password && (
          <p className="text-sm text-red-700" id="password-error">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <output aria-live="polite" className="min-h-6 text-sm text-red-700">
        {state.message}
      </output>

      <button
        className="rounded-full bg-emerald-800 px-6 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "送信中…" : isSignUp ? "アカウントを作成" : "ログイン"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {isSignUp ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}
        <Link
          className="ml-2 font-semibold text-emerald-700 hover:text-emerald-900"
          href={alternatePath}
        >
          {isSignUp ? "ログイン" : "アカウント作成"}
        </Link>
      </p>
    </form>
  );
}
