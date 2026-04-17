import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ShoppingCart,
  UserPlus,
  Users,
  Banknote,
} from "lucide-react";
import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatKRW, formatNumber } from "@/lib/utils";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/domain";
import type { OrderStatus } from "@/lib/domain";

export const metadata = { title: "대리점 대시보드" };

export default async function Page() {
  const { supabase, franchiseId } = await requireFranchise();

  const todayStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  })();
  const monthStart = (() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  })();

  const [todayRes, monthRes, recentRes, customersRes] = await Promise.all([
    supabase
      .from("orders")
      .select("price", { count: "exact" })
      .eq("franchise_id", franchiseId)
      .gte("ordered_at", todayStart),
    supabase
      .from("orders")
      .select("price", { count: "exact" })
      .eq("franchise_id", franchiseId)
      .gte("ordered_at", monthStart),
    supabase
      .from("orders")
      .select(
        "id, price, status, ordered_at, products(name), customers(name)",
      )
      .eq("franchise_id", franchiseId)
      .order("ordered_at", { ascending: false })
      .limit(10),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("franchise_id", franchiseId)
      .is("deleted_at", null),
  ]);

  const todaySum = (todayRes.data ?? []).reduce(
    (a, r) => a + (r.price ?? 0),
    0,
  );
  const monthSum = (monthRes.data ?? []).reduce(
    (a, r) => a + (r.price ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="오늘과 이번 달 영업 현황을 확인합니다."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/franchise/customers/new">
                <UserPlus className="h-4 w-4" /> 고객 등록
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/franchise/catalog">
                <BookOpen className="h-4 w-4" /> 카탈로그
              </Link>
            </Button>
            <Button asChild>
              <Link href="/franchise/orders/new">
                <ShoppingCart className="h-4 w-4" /> 주문 등록
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="오늘 매출" value={formatKRW(todaySum)} icon={<Banknote className="h-4 w-4" />} />
        <KpiCard
          label="오늘 주문"
          value={`${formatNumber(todayRes.count ?? 0)}건`}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <KpiCard label="이번달 매출" value={formatKRW(monthSum)} />
        <KpiCard
          label="등록 고객"
          value={`${formatNumber(customersRes.count ?? 0)}명`}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>최근 주문</CardTitle>
          <Link
            href="/franchise/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            모두 보기 <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>고객</Th>
                <Th>상품</Th>
                <Th>금액</Th>
                <Th>주문 일시</Th>
                <Th>상태</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(recentRes.data ?? []).length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                    주문이 아직 없습니다.
                  </Td>
                </Tr>
              ) : (
                (recentRes.data ?? []).map((o) => {
                  const status = o.status as OrderStatus;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pr = (o as any).products;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cu = (o as any).customers;
                  return (
                    <Tr key={o.id as string}>
                      <Td className="font-medium">
                        <Link
                          href={`/franchise/orders/${o.id}`}
                          className="hover:underline"
                        >
                          {cu?.name ?? "-"}
                        </Link>
                      </Td>
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
