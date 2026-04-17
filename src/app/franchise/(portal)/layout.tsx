import { requireFranchise } from "@/lib/auth/guard";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  BarChart3,
  UserCog,
  LogOut,
} from "lucide-react";
import { AppShell, type NavGroup } from "@/components/layout/app-shell";
import { signOutFranchise } from "./sign-out";
import { Button } from "@/components/ui/button";

const groups: NavGroup[] = [
  {
    items: [
      {
        href: "/franchise/dashboard",
        label: "대시보드",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
    ],
  },
  {
    label: "영업",
    items: [
      {
        href: "/franchise/customers",
        label: "고객",
        icon: <Users className="h-4 w-4" />,
        matchPrefix: true,
      },
      {
        href: "/franchise/catalog",
        label: "카탈로그",
        icon: <BookOpen className="h-4 w-4" />,
        matchPrefix: true,
      },
      {
        href: "/franchise/orders",
        label: "주문",
        icon: <ShoppingCart className="h-4 w-4" />,
        matchPrefix: true,
      },
    ],
  },
  {
    label: "기타",
    items: [
      {
        href: "/franchise/statistics",
        label: "통계",
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        href: "/franchise/mypage",
        label: "내 정보",
        icon: <UserCog className="h-4 w-4" />,
      },
    ],
  },
];

export default async function FranchisePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, franchiseId } = await requireFranchise();
  const { data: fr } = await supabase
    .from("franchises")
    .select("name, code")
    .eq("id", franchiseId)
    .maybeSingle();

  return (
    <AppShell
      brand={fr?.name ?? "대리점"}
      subBrand="Cellings · 대리점"
      groups={groups}
      theme="slate"
      user={
        <form action={signOutFranchise}>
          <div className="mb-2 text-xs text-slate-400">
            {fr?.code ? <span className="font-mono">{fr.code}</span> : null}
          </div>
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
