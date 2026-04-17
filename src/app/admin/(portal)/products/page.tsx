import Link from "next/link";
import { Grid3X3, List, Package, Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import {
  categoryLabel,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
  type ProductType,
} from "@/lib/domain";
import { formatKRW } from "@/lib/utils";

export const metadata = { title: "상품" };

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    category?: string | "all";
    type?: ProductType | "all";
    status?: "all" | "active" | "inactive";
    view?: "grid" | "list";
  };
}) {
  const { supabase } = await requireAdmin();
  const q = (searchParams.q ?? "").trim();
  const category = searchParams.category ?? "all";
  const type = searchParams.type ?? "all";
  const status = searchParams.status ?? "all";
  const view = searchParams.view ?? "grid";

  const { data: categories } = await supabase
    .from("product_categories")
    .select("slug, name, is_active, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const categoryMap = Object.fromEntries(
    (categories ?? []).map((c) => [c.slug as string, c.name as string]),
  ) as Record<string, string>;

  let query = supabase
    .from("products")
    .select(
      "id, name, category_slug, product_type, thumbnail_url, price_fixed, price_min, price_max, is_active, sort_order, created_at, product_categories(name)",
    )
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (category !== "all") query = query.eq("category_slug", category);
  if (type !== "all") query = query.eq("product_type", type);
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);

  const { data } = await query;
  const list = data ?? [];

  const buildUrl = (patch: Record<string, string>) => {
    const u = new URLSearchParams({
      ...(q ? { q } : {}),
      category,
      type,
      status,
      view,
      ...patch,
    } as Record<string, string>);
    return `/admin/products?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="상품"
        description="상품을 등록·수정·비활성화합니다. 저장 즉시 전 대리점 카탈로그에 반영됩니다."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" /> 상품 추가
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <form action="" method="get" className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="상품명 검색" className="pl-9" />
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="view" value={view} />
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

          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            <Link
              href={buildUrl({ type: "all" })}
              className={
                type === "all"
                  ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                  : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
              }
            >
              전체 유형
            </Link>
            {PRODUCT_TYPE_OPTIONS.map((t) => (
              <Link
                key={t.value}
                href={buildUrl({ type: t.value })}
                className={
                  type === t.value
                    ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                    : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            {[
              { v: "all", l: "전체" },
              { v: "active", l: "활성" },
              { v: "inactive", l: "비활성" },
            ].map((s) => (
              <Link
                key={s.v}
                href={buildUrl({ status: s.v })}
                className={
                  status === s.v
                    ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                    : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                {s.l}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex gap-1 rounded-lg border border-border bg-background p-1">
            <Link
              href={buildUrl({ view: "grid" })}
              aria-label="그리드 보기"
              className={
                view === "grid"
                  ? "rounded-md bg-foreground px-2 py-1 text-primary-foreground"
                  : "rounded-md px-2 py-1 text-muted-foreground"
              }
            >
              <Grid3X3 className="h-4 w-4" />
            </Link>
            <Link
              href={buildUrl({ view: "list" })}
              aria-label="리스트 보기"
              className={
                view === "list"
                  ? "rounded-md bg-foreground px-2 py-1 text-primary-foreground"
                  : "rounded-md px-2 py-1 text-muted-foreground"
              }
            >
              <List className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="상품이 없습니다"
          description="첫 상품을 등록해 보세요."
          action={
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" /> 상품 추가
              </Link>
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {p.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail_url as string}
                    alt={p.name as string}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
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
                  {!p.is_active ? (
                    <Badge variant="destructive">비활성</Badge>
                  ) : null}
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
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <Thead>
                <Tr>
                  <Th>상품</Th>
                  <Th>카테고리</Th>
                  <Th>유형</Th>
                  <Th>가격</Th>
                  <Th>상태</Th>
                </Tr>
              </Thead>
              <Tbody>
                {list.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                          {p.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.thumbnail_url as string}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="font-medium hover:underline">
                          {p.name as string}
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      {(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pc = (p as any).product_categories;
                        const name = pc?.name as string | undefined;
                        return name ?? categoryLabel(p.category_slug as string, categoryMap);
                      })()}
                    </Td>
                    <Td>{PRODUCT_TYPE_LABEL[p.product_type as ProductType]}</Td>
                    <Td className="tabular-nums">
                      {p.product_type === "ready_made"
                        ? formatKRW(p.price_fixed as number)
                        : `${formatKRW(p.price_min as number)} ~ ${formatKRW(
                            p.price_max as number,
                          )}`}
                    </Td>
                    <Td>
                      {p.is_active ? (
                        <Badge variant="success">활성</Badge>
                      ) : (
                        <Badge variant="destructive">비활성</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
