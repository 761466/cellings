import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./admin-login-form";

export const metadata = { title: "중앙관리 로그인" };

export default async function AdminLoginPage() {
  const profile = await getUserProfile();
  if (profile?.role === "super_admin") redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-elevated backdrop-blur">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Cellings
          </div>
          <h1 className="mt-1 text-xl font-semibold">중앙관리 로그인</h1>
          <p className="mt-1 text-sm text-slate-400">
            슈퍼 관리자 계정으로 로그인하세요.
          </p>
        </div>
        <AdminLoginForm />
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-slate-200"
          >
            <ArrowLeft className="h-3 w-3" /> 처음으로
          </Link>
          <Link
            href="/franchise/login"
            className="hover:text-slate-200"
          >
            대리점 로그인 →
          </Link>
        </div>
      </div>
    </div>
  );
}
