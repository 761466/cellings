"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginFranchise, type FranchiseLoginState } from "./actions";

const initialState: FranchiseLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {pending ? "로그인 중…" : "로그인"}
    </button>
  );
}

export function FranchiseLoginForm() {
  const [state, formAction] = useFormState(loginFranchise, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="code" className="mb-1 block text-sm text-slate-600">
          대리점 코드
        </label>
        <input
          id="code"
          name="code"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-400 focus:ring-2"
          placeholder="예: FD-0042"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-slate-600">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-400 focus:ring-2"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
