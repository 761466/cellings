import { getUserProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Tags,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
} from "lucide-react";
import { AppShell, type NavGroup } from "@/components/layout/app-shell";
import { signOutAdmin } from "./sign-out";
import { Button } from "@/components/ui/button";

const groups: NavGroup[] = [
  {
    items: [
      {
        href: "/admin/dashboard",
        label: "대시보드",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
    ],
  },
  {
    label: "운영",
    items: [
      {
        href: "/admin/franchises",
        label: "대리점",
        icon: <Store className="h-4 w-4" />,
        matchPrefix: true,
      },
      {
        href: "/admin/products",
        label: "상품",
        icon: <Package className="h-4 w-4" />,
        matchPrefix: true,
      },
      {
        href: "/admin/categories",
        label: "카테고리",
        icon: <Tags className="h-4 w-4" />,
        matchPrefix: true,
      },
      {
        href: "/admin/orders",
        label: "주문",
        icon: <ShoppingCart className="h-4 w-4" />,
        matchPrefix: true,
      },
    ],
  },
  {
    label: "분석",
    items: [
      {
        href: "/admin/statistics",
        label: "통계",
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
];

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "super_admin") redirect("/franchise/dashboard");

  return (
    <AppShell
      brand="중앙관리"
      subBrand="Cellings"
      groups={groups}
      theme="ink"
      user={
        <form action={signOutAdmin}>
          <div className="mb-2 text-xs text-slate-400">Super Admin</div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </form>
      }
    >
      {children}
    </AppShell>
  );
}
