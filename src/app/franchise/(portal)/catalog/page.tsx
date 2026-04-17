import Link from "next/link";
import { Search } from "lucide-react";
import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCT_TYPE_LABEL,
  type ProductType,
  categoryLabel,
} from "@/lib/domain";
import { formatKRW } from "@/lib/utils";

export const metadata = { title: "카탈로그" };

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; category?: string | "all" };
}) {
  const { supabase } = await requireFranchise();
  const q = (searchParams.q ?? "").trim();
  const category = searchParams.category ?? "all";

  const { data: categories } = await supabase
    .from("product_categories")
    .select("slug, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const categoryMap = Object.fromEntries(
    (categories ?? []).map((c) => [c.slug as string, c.name as string]),
  ) as Record<string, string>;

  let query = supabase
    .from("products")
    .select(
      "id, name, category_slug, product_type, thumbnail_url, price_fixed, price_min, price_max, lead_time_days, product_categories(name)",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);
  if (category !== "all") query = query.eq("category_slug", category);

  const { data } = await query;
  const list = data ?? [];

  const buildUrl = (patch: Record<string, string>) => {
    const u = new URLSearchParams({
      ...(q ? { q } : {}),
      category,
      ...patch,
    } as Record<string, string>);
    return `/franchise/catalog?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="카탈로그"
        description="전 상품을 태블릿에서 고객과 함께 탐색하세요."
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <form method="get" className="relative flex-1 min-w-[220px]">
            <input type="hidden" name="category" value={category} />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="상품명 검색"
              className="pl-9"
            />
          </form>

          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            <Link
              href={buildUrl({ category: "all" })}
              className={
                category === "all"
                  ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                  : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
              }
            >
              전체
            </Link>
            {(categories ?? []).map((c) => (
              <Link
                key={c.slug as string}
                href={buildUrl({ category: c.slug as string })}
                className={
                  category === (c.slug as string)
                    ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                    : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                {c.name as string}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          노출 가능한 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <Link
              key={p.id as string}
              href={`/franchise/catalog/${p.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {p.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail_url as string}
                    alt={p.name as string}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant="outline">
                    {(() => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const pc = (p as any).product_categories;
                      const name = pc?.name as string | undefined;
                      return name ?? categoryLabel(p.category_slug as string, categoryMap);
                    })()}
                  </Badge>
                  <Badge variant="accent">
                    {PRODUCT_TYPE_LABEL[p.product_type as ProductType]}
                  </Badge>
                </div>
                <div className="truncate text-sm font-semibold">
                  {p.name as string}
                </div>
                <div className="text-sm tabular-nums text-foreground/80">
                  {p.product_type === "ready_made"
                    ? formatKRW(p.price_fixed as number)
                    : `${formatKRW(p.price_min as number)} ~ ${formatKRW(
                        p.price_max as number,
                      )}`}
                </div>
                {p.product_type !== "ready_made" && p.lead_time_days ? (
                  <div className="text-xs text-muted-foreground">
                    약 {p.lead_time_days}일 소요
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
