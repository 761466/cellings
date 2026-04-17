import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { ORDER_TABS, STATUS_COLOR, STATUS_LABEL } from "@/lib/domain";
import type { OrderStatus, OrderTab } from "@/lib/domain";
import { formatDateTime, formatKRW } from "@/lib/utils";

export const metadata = { title: "전체 주문" };

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string; tab?: OrderTab };
}) {
  const { supabase } = await requireAdmin();
  const q = (searchParams.q ?? "").trim();
  const tab: OrderTab = (searchParams.tab ?? "all") as OrderTab;
  const statuses = ORDER_TABS.find((t) => t.value === tab)?.statuses;

  let query = supabase
    .from("orders")
    .select(
      "id, price, status, ordered_at, franchises(name, code), products(name), customers(name, phone)",
    )
    .order("ordered_at", { ascending: false })
    .limit(200);

  if (statuses && statuses.length) query = query.in("status", statuses);
  if (q) {
    // 대리점 조인 검색은 복잡하므로 고객명 기준 필터
    query = query.ilike("customers.name", `%${q}%`);
  }

  const { data } = await query;
  const list = data ?? [];

  const buildUrl = (patch: Record<string, string>) => {
    const u = new URLSearchParams({
      ...(q ? { q } : {}),
      tab,
      ...patch,
    } as Record<string, string>);
    return `/admin/orders?${u.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="전체 주문"
        description="전 대리점 주문을 통합 조회합니다."
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            {ORDER_TABS.map((t) => (
              <Link
                key={t.value}
                href={buildUrl({ tab: t.value })}
                className={
                  tab === t.value
                    ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                    : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                {t.label}
              </Link>
            ))}
          </div>

          <form method="get" className="relative ml-auto flex-1 min-w-[220px]">
            <input type="hidden" name="tab" value={tab} />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="고객명 검색"
              className="pl-9"
            />
          </form>
          <Button type="submit" size="sm" variant="outline">
            검색
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>주문번호</Th>
                <Th>대리점</Th>
                <Th>고객</Th>
                <Th>상품</Th>
                <Th>금액</Th>
                <Th>주문 일시</Th>
                <Th>상태</Th>
              </Tr>
            </Thead>
            <Tbody>
              {list.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="py-10 text-center text-muted-foreground">
                    주문이 없습니다.
                  </Td>
                </Tr>
              ) : (
                list.map((o) => {
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
                      <Td className="font-medium">{fr?.name ?? "-"}</Td>
                      <Td>{cu?.name ?? "-"}</Td>
                      <Td>{pr?.name ?? "-"}</Td>
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
