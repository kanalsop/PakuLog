import Link from "next/link";

import { AuthForm } from "./auth_form";

interface AuthPageProperties {
  mode: "signIn" | "signUp";
  nextPath: string;
}

export function AuthPage({ mode, nextPath }: AuthPageProperties) {
  const isSignUp = mode === "signUp";

  return (
    <main className="min-h-screen px-5 py-10 sm:px-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-4">
          <Link
            className="w-fit text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            href="/"
          >
            ← PakuLog
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
              {isSignUp ? "Create account" : "Welcome back"}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-emerald-950">
              {isSignUp ? "アカウント作成" : "ログイン"}
            </h1>
            <p className="leading-7 text-slate-600">
              {isSignUp
                ? "食事記録を安全に保存するためのアカウントを作成します。"
                : "食事記録を続けるため、アカウントへログインしてください。"}
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-emerald-950/10 bg-white/80 p-6 shadow-sm sm:p-8">
          <AuthForm mode={mode} nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
