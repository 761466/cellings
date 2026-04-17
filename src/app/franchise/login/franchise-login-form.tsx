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
      className="w-full rounded-lg bg-foreground py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "로그인 중…" : "로그인"}
    </button>
  );
}

export function FranchiseLoginForm() {
  const [state, formAction] = useFormState(loginFranchise, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="code" className="block text-xs text-muted-foreground">
          대리점 코드
        </label>
        <input
          id="code"
          name="code"
          type="text"
          autoComplete="username"
          required
          placeholder="예: FD-0042"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs text-muted-foreground">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>
      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
