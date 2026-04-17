import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import {
  STATUS_COLOR,
  STATUS_LABEL,
  type OrderStatus,
  categoryLabel,
} from "@/lib/domain";
import { formatKRW, formatNumber } from "@/lib/utils";
import { resolveRange, rangeBuckets } from "@/lib/range";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "통계" };

export default async function Page({
  searchParams,
}: {
  searchParams: {
    range?: "day" | "month" | "year" | "custom";
    from?: string;
    to?: string;
    franchise?: string;
  };
}) {
  const { supabase } = await requireAdmin();
  const { start, end, key } = resolveRange(
    searchParams.range,
    searchParams.from,
    searchParams.to,
  );
  const franchiseFilter = searchParams.franchise ?? "all";

  const { data: franchises } = await supabase
    .from("franchises")
    .select("id, name, code")
    .order("name");

  const { data: categories } = await supabase
    .from("product_categories")
    .select("slug, name")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const categoryMap = Object.fromEntries(
    (categories ?? []).map((c) => [c.slug as string, c.name as string]),
  ) as Record<string, string>;

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, price, status, ordered_at, franchise_id, franchises(name, code), products(name, category_slug, product_categories(name)), customers(name)",
    )
    .gte("ordered_at", start.toISOString())
    .lte("ordered_at", end.toISOString())
    .order("ordered_at", { ascending: false });
  if (franchiseFilter !== "all") {
    ordersQuery = ordersQuery.eq("franchise_id", franchiseFilter);
  }
  const { data: orders } = await ordersQuery;
  const list = orders ?? [];

  const total = list.reduce((a, o) => a + (o.price ?? 0), 0);
  const avg = list.length > 0 ? Math.round(total / list.length) : 0;
  const franchiseSet = new Set(list.map((o) => o.franchise_id));

  // 기간별 막대 차트 (일단위)
  const buckets = rangeBuckets(start, end);
  const bucketMap = new Map(buckets.map((k) => [k, 0]));
  list.forEach((o) => {
    const k = (o.ordered_at as string).slice(0, 10);
    if (bucketMap.has(k)) {
      bucketMap.set(k, (bucketMap.get(k) ?? 0) + (o.price ?? 0));
    }
  });
  const chartData = [...bucketMap.entries()].map(([k, v]) => {
    const d = new Date(k);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, revenue: v };
  });

  // 카테고리별 주문 수
  const byCat = new Map<string, number>();
  list.forEach((o) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = (o as any).products?.category_slug as string | undefined;
    if (!c) return;
    byCat.set(c, (byCat.get(c) ?? 0) + 1);
  });
  const donutData = [...byCat.entries()].map(([k, v]) => ({
    label: categoryLabel(k, categoryMap),
    value: v,
  }));

  // 대리점 테이블
  const byFr = new Map<
    string,
    { name: string; code: string; revenue: number; orders: number }
  >();
  list.forEach((o) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fr = (o as any).franchises;
    const id = o.franchise_id as string;
    const cur = byFr.get(id) ?? {
      name: fr?.name ?? "-",
      code: fr?.code ?? "",
      revenue: 0,
      orders: 0,
    };
    cur.revenue += o.price ?? 0;
    cur.orders += 1;
    byFr.set(id, cur);
  });
  const franchiseRanking = [...byFr.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const buildUrl = (patch: Record<string, string>) => {
    const u = new URLSearchParams({
      range: key,
      ...(searchParams.from ? { from: searchParams.from } : {}),
      ...(searchParams.to ? { to: searchParams.to } : {}),
      franchise: franchiseFilter,
      ...patch,
    });
    return `/admin/statistics?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="통계"
        description="기간과 대리점을 선택해 매출·주문을 분석합니다."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/api/admin/statistics/export?${new URLSearchParams({
                  range: key,
                  ...(searchParams.from ? { from: searchParams.from } : {}),
                  ...(searchParams.to ? { to: searchParams.to } : {}),
                  ...(franchiseFilter !== "all"
                    ? { franchise: franchiseFilter }
                    : {}),
                  kind: "franchises",
                }).toString()}`}
              >
                <Download className="h-4 w-4" /> 대리점 CSV
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/api/admin/statistics/export?${new URLSearchParams({
                  range: key,
                  ...(searchParams.from ? { from: searchParams.from } : {}),
                  ...(searchParams.to ? { to: searchParams.to } : {}),
                  ...(franchiseFilter !== "all"
                    ? { franchise: franchiseFilter }
                    : {}),
                  kind: "orders",
                }).toString()}`}
              >
                <Download className="h-4 w-4" /> 주문 CSV
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            {[
              { v: "day", l: "일간" },
              { v: "month", l: "월간" },
              { v: "year", l: "연간" },
              { v: "custom", l: "기간 설정" },
            ].map((t) => (
              <Link
                key={t.v}
                href={buildUrl({ range: t.v })}
                className={
                  key === t.v
                    ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                    : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                {t.l}
              </Link>
            ))}
          </div>

          {key === "custom" ? (
            <form method="get" className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="range" value="custom" />
              {franchiseFilter !== "all" ? (
                <input type="hidden" name="franchise" value={franchiseFilter} />
              ) : null}
              <label className="text-xs text-muted-foreground">
                시작{" "}
                <input
                  type="date"
                  name="from"
                  defaultValue={searchParams.from ?? ""}
                  className="ml-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                종료{" "}
                <input
                  type="date"
                  name="to"
                  defaultValue={searchParams.to ?? ""}
                  className="ml-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
              </label>
              <Button type="submit" size="sm">
                적용
              </Button>
            </form>
          ) : null}

          <form method="get" className="ml-auto flex items-end gap-2">
            <input type="hidden" name="range" value={key} />
            {searchParams.from ? (
              <input type="hidden" name="from" value={searchParams.from} />
            ) : null}
            {searchParams.to ? (
              <input type="hidden" name="to" value={searchParams.to} />
            ) : null}
            <label className="text-xs text-muted-foreground">
              대리점{" "}
              <select
                name="franchise"
                defaultValue={franchiseFilter}
                className="ml-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                <option value="all">전체</option>
                {(franchises ?? []).map((f) => (
                  <option key={f.id} value={f.id as string}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" size="sm" variant="outline">
              적용
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="총 매출" value={formatKRW(total)} />
        <KpiCard label="총 주문" value={`${formatNumber(list.length)}건`} />
        <KpiCard label="평균 주문 금액" value={formatKRW(avg)} />
        <KpiCard
          label="주문 발생 대리점"
          value={`${formatNumber(franchiseSet.size)}개`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기간별 매출 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 주문 비중</CardTitle>
          </CardHeader>
          <CardContent>
            {donutData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                데이터가 없습니다.
              </p>
            ) : (
              <>
                <CategoryDonut data={donutData} />
                <ul className="mt-3 space-y-1 text-sm">
                  {donutData.map((d) => (
                    <li key={d.label} className="flex justify-between">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="tabular-nums">{d.value}건</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>대리점 랭킹</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>순위</Th>
                <Th>대리점</Th>
                <Th>매출</Th>
                <Th>주문</Th>
                <Th>평균 단가</Th>
              </Tr>
            </Thead>
            <Tbody>
              {franchiseRanking.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                    기간 내 주문이 없습니다.
                  </Td>
                </Tr>
              ) : (
                franchiseRanking.map((r, i) => (
                  <Tr key={r.id}>
                    <Td className="font-semibold">{i + 1}</Td>
                    <Td>
                      <Link
                        href={`/admin/franchises/${r.id}`}
                        className="font-medium hover:underline"
                      >
                        {r.name}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {r.code}
                      </span>
                    </Td>
                    <Td className="tabular-nums">{formatKRW(r.revenue)}</Td>
                    <Td>{r.orders}건</Td>
                    <Td className="tabular-nums">
                      {formatKRW(Math.round(r.revenue / r.orders))}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>주문 리스트</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>주문번호</Th>
                <Th>대리점</Th>
                <Th>고객</Th>
                <Th>상품</Th>
                <Th>금액</Th>
                <Th>상태</Th>
              </Tr>
            </Thead>
            <Tbody>
              {list.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="py-10 text-center text-muted-foreground">
                    주문이 없습니다.
                  </Td>
                </Tr>
              ) : (
                list.slice(0, 50).map((o) => {
                  const status = o.status as OrderStatus;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const fr = (o as any).franchises;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pr = (o as any).products;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cu = (o as any).customers;
                  return (
                    <Tr key={o.id as string}>
                      <Td className="font-mono text-xs">
                        {(o.id as string).slice(0, 8)}
                      </Td>
                      <Td>{fr?.name ?? "-"}</Td>
                      <Td>{cu?.name ?? "-"}</Td>
                      <Td>{pr?.name ?? "-"}</Td>
                      <Td className="tabular-nums">
                        {formatKRW(o.price as number)}
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
