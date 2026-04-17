import Link from "next/link";
import {
  Banknote,
  ShoppingCart,
  Store,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatKRW, formatNumber } from "@/lib/utils";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/domain";
import type { OrderStatus } from "@/lib/domain";

export const metadata = {
  title: "대시보드",
};

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const todayStart = startOfToday().toISOString();
  const todayEnd = endOfToday().toISOString();
  const monthStart = startOfMonth().toISOString();

  const [
    todayOrdersRes,
    monthOrdersRes,
    franchisesRes,
    recentOrdersRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("price", { count: "exact" })
      .gte("ordered_at", todayStart)
      .lte("ordered_at", todayEnd),
    supabase
      .from("orders")
      .select("price, franchise_id, ordered_at", { count: "exact" })
      .gte("ordered_at", monthStart),
    supabase
      .from("franchises")
      .select("id, name", { count: "exact" })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select(
        "id, price, status, ordered_at, franchises(name), products(name), customers(name)",
      )
      .order("ordered_at", { ascending: false })
      .limit(10),
  ]);

  const todaySum =
    todayOrdersRes.data?.reduce((acc, r) => acc + (r.price ?? 0), 0) ?? 0;
  const monthSum =
    monthOrdersRes.data?.reduce((acc, r) => acc + (r.price ?? 0), 0) ?? 0;

  // 최근 14일 매출 추이
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);
  const { data: trendOrders } = await supabase
    .from("orders")
    .select("price, ordered_at")
    .gte("ordered_at", since.toISOString())
    .order("ordered_at", { ascending: true });

  const days: { label: string; revenue: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      revenue: 0,
    });
    (trendOrders ?? []).forEach((o) => {
      if ((o.ordered_at as string).slice(0, 10) === key) {
        days[i].revenue += o.price ?? 0;
      }
    });
  }

  // TOP 10 대리점 (이번 달)
  const revenueByFid = new Map<string, number>();
  (monthOrdersRes.data ?? []).forEach((o) => {
    if (!o.franchise_id) return;
    revenueByFid.set(
      o.franchise_id as string,
      (revenueByFid.get(o.franchise_id as string) ?? 0) + (o.price ?? 0),
    );
  });
  const topFranchiseIds = [...revenueByFid.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const { data: topFranchisesData } = topFranchiseIds.length
    ? await supabase
        .from("franchises")
        .select("id, name, code")
        .in(
          "id",
          topFranchiseIds.map(([id]) => id),
        )
    : { data: [] as { id: string; name: string; code: string }[] };

  const topFranchises = topFranchiseIds.map(([fid, revenue], idx) => {
    const f = (topFranchisesData ?? []).find((x) => x.id === fid);
    const orders = (monthOrdersRes.data ?? []).filter(
      (o) => o.franchise_id === fid,
    ).length;
    return {
      rank: idx + 1,
      id: fid,
      name: f?.name ?? "-",
      code: f?.code ?? "",
      revenue,
      orders,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="전체 매출·주문 현황을 한눈에 확인합니다."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="오늘 매출"
          value={formatKRW(todaySum)}
          icon={<Banknote className="h-4 w-4" />}
        />
        <KpiCard
          label="오늘 주문"
          value={`${formatNumber(todayOrdersRes.count ?? 0)}건`}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <KpiCard
          label="이번달 매출"
          value={formatKRW(monthSum)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="활성 대리점"
          value={`${formatNumber(franchisesRes.count ?? 0)}개`}
          icon={<Store className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 14일 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={days} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>이번달 매출 TOP 10</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topFranchises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                이번달 주문이 아직 없습니다.
              </p>
            ) : (
              topFranchises.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/franchises/${t.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-foreground/5 text-xs font-semibold">
                      {t.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {t.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {t.code} · {t.orders}건
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatKRW(t.revenue)}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>최근 주문</CardTitle>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            모두 보기 <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>대리점</Th>
                <Th>상품</Th>
                <Th>고객</Th>
                <Th>금액</Th>
                <Th>주문 일시</Th>
                <Th>상태</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(recentOrdersRes.data ?? []).length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="py-10 text-center text-muted-foreground">
                    주문이 아직 없습니다.
                  </Td>
                </Tr>
              ) : (
                (recentOrdersRes.data ?? []).map((o) => {
                  const status = o.status as OrderStatus;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const fr = (o as any).franchises;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pr = (o as any).products;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cu = (o as any).customers;
                  return (
                    <Tr key={o.id}>
                      <Td className="font-medium">{fr?.name ?? "-"}</Td>
                      <Td>{pr?.name ?? "-"}</Td>
                      <Td>{cu?.name ?? "-"}</Td>
                      <Td className="tabular-nums">
                        {formatKRW(o.price as number)}
                      </Td>
                      <Td className="text-muted-foreground">
                        {formatDateTime(o.ordered_at as string)}
                      </Td>
                      <Td>
                        <Badge variant={STATUS_COLOR[status] as never}>
                          {STATUS_LABEL[status]}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
