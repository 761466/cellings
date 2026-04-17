import { getUserProfile } from "@/lib/auth/profile";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutFranchise } from "./sign-out";

export default async function FranchisePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/franchise/login");
  if (profile.role !== "franchise_admin") redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/franchise/dashboard" className="font-semibold tracking-tight">
            Cellings · 대리점
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/franchise/dashboard" className="text-slate-600 hover:text-slate-900">
              대시보드
            </Link>
            <Link href="/franchise/customers" className="text-slate-600 hover:text-slate-900">
              고객
            </Link>
            <Link href="/franchise/catalog" className="text-slate-600 hover:text-slate-900">
              카탈로그
            </Link>
            <Link href="/franchise/orders" className="text-slate-600 hover:text-slate-900">
              주문
            </Link>
            <Link href="/franchise/statistics" className="text-slate-600 hover:text-slate-900">
              통계
            </Link>
            <Link href="/franchise/mypage" className="text-slate-600 hover:text-slate-900">
              내 정보
            </Link>
            <form action={signOutFranchise}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
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
