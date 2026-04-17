import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";
import { FranchiseLoginForm } from "./franchise-login-form";

export const metadata = { title: "대리점 로그인" };

export default async function FranchiseLoginPage() {
  const profile = await getUserProfile();
  if (profile?.role === "franchise_admin") redirect("/franchise/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Cellings · Franchise
          </div>
          <h1 className="mt-1 text-xl font-semibold">대리점 로그인</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            본사에서 발급한 대리점 코드로 로그인하세요.
          </p>
        </div>
        <FranchiseLoginForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          비밀번호를 잊으셨나요? 등록된 점주 이메일로 재설정 링크가 자동 발송됩니다. 본사에 요청해 주세요.
        </p>
        <div className="mt-4 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> 처음으로
          </Link>
          <Link
            href="/admin/login"
            className="text-muted-foreground hover:text-foreground"
          >
            중앙관리 →
          </Link>
        </div>
      </div>
    </div>
  );
}
