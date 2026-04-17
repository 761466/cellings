"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAdmin, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:opacity-60"
    >
      {pending ? "로그인 중…" : "로그인"}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useFormState(loginAdmin, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs text-slate-400">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-white/30 focus:ring-2 focus:ring-white/10"
          placeholder="admin@cellings.kr"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs text-slate-400">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
        />
      </div>
      {state.error ? (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
