import { getUserProfile } from "@/lib/auth/profile";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminLoginPage() {
  const profile = await getUserProfile();
  if (profile?.role === "super_admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-zinc-900">
          중앙관리 로그인
        </h1>
        <AdminLoginForm />
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="underline hover:text-zinc-800">
            처음으로
          </Link>
        </p>
      </div>
    </div>
  );
}
