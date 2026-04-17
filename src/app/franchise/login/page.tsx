import { getUserProfile } from "@/lib/auth/profile";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FranchiseLoginForm } from "./franchise-login-form";

export default async function FranchiseLoginPage() {
  const profile = await getUserProfile();
  if (profile?.role === "franchise_admin") {
    redirect("/franchise/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">
          대리점 로그인
        </h1>
        <FranchiseLoginForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          비밀번호 재설정은 등록된 이메일로 링크가 발송됩니다.
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          <Link href="/" className="underline hover:text-slate-800">
            처음으로
          </Link>
        </p>
      </div>
    </div>
  );
}
