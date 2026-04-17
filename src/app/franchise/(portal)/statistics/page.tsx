import Link from "next/link";
import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { RevenueBarChart } from "@/components/charts/revenue-bar-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { Button } from "@/components/ui/button";
import { formatKRW, formatNumber } from "@/lib/utils";
import { rangeBuckets, resolveRange } from "@/lib/range";
import { categoryLabel } from "@/lib/domain";

export const metadata = { title: "통계" };

export default async function Page({
  searchParams,
}: {
  searchParams: { range?: "day" | "month" | "year" | "custom"; from?: string; to?: string };
}) {
  const { supabase, franchiseId } = await requireFranchise();
  const { start, end, key } = resolveRange(
    searchParams.range,
    searchParams.from,
    searchParams.to,
  );
  const { data: categories } = await supabase
    .from("product_categories")
    .select("slug, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const categoryMap = Object.fromEntries(
    (categories ?? []).map((c) => [c.slug as string, c.name as string]),
  ) as Record<string, string>;

  const { data } = await supabase
    .from("orders")
    .select("price, ordered_at, products(category_slug, product_categories(name))")
    .eq("franchise_id", franchiseId)
    .gte("ordered_at", start.toISOString())
    .lte("ordered_at", end.toISOString());
  const list = data ?? [];

  const total = list.reduce((a, o) => a + (o.price ?? 0), 0);
  const avg = list.length > 0 ? Math.round(total / list.length) : 0;

  const buckets = rangeBuckets(start, end);
  const bucketMap = new Map(buckets.map((k) => [k, 0]));
  list.forEach((o) => {
    const k = (o.ordered_at as string).slice(0, 10);
    if (bucketMap.has(k))
      bucketMap.set(k, (bucketMap.get(k) ?? 0) + (o.price ?? 0));
  });
  const chartData = [...bucketMap.entries()].map(([k, v]) => {
    const d = new Date(k);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, revenue: v };
  });

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

  const buildUrl = (patch: Record<string, string>) => {
    const u = new URLSearchParams({
      range: key,
      ...(searchParams.from ? { from: searchParams.from } : {}),
      ...(searchParams.to ? { to: searchParams.to } : {}),
      ...patch,
    });
    return `/franchise/statistics?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="통계"
        description="내 매장의 기간별 매출·주문을 확인합니다."
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="총 매출" value={formatKRW(total)} />
        <KpiCard label="총 주문" value={`${formatNumber(list.length)}건`} />
        <KpiCard label="평균 주문 금액" value={formatKRW(avg)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기간별 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 주문</CardTitle>
          </CardHeader>
          <CardContent>
            {donutData.length === 0 ? (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
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
    </div>
  );
}
