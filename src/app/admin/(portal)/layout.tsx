import { getUserProfile } from "@/lib/auth/profile";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAdmin } from "./sign-out";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "super_admin") redirect("/franchise/dashboard");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin/dashboard" className="font-semibold tracking-tight">
            Cellings · 중앙관리
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/dashboard" className="text-zinc-600 hover:text-zinc-900">
              대시보드
            </Link>
            <Link href="/admin/franchises" className="text-zinc-600 hover:text-zinc-900">
              대리점
            </Link>
            <Link href="/admin/products" className="text-zinc-600 hover:text-zinc-900">
              상품
            </Link>
            <Link href="/admin/orders" className="text-zinc-600 hover:text-zinc-900">
              주문
            </Link>
            <Link href="/admin/statistics" className="text-zinc-600 hover:text-zinc-900">
              통계
            </Link>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-100"
              >
                로그아웃
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
