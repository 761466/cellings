import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatDate, formatDateTime, formatKRW } from "@/lib/utils";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/domain";
import type { OrderStatus } from "@/lib/domain";
import { FranchiseDetailClient } from "./franchise-detail-client";

export const metadata = { title: "대리점 상세" };

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireAdmin();
  const { data: f } = await supabase
    .from("franchises")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!f) notFound();

  const { data: recentOrders } = await supabase
    .from("orders")
    .select(
      "id, price, status, ordered_at, products(name), customers(name)",
    )
    .eq("franchise_id", params.id)
    .order("ordered_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <PageHeader
        title={f.name}
        description={
          <span className="flex items-center gap-2">
            <Badge variant={f.is_active ? "success" : "destructive"}>
              {f.is_active ? "활성" : "비활성"}
            </Badge>
            <span>개설일 {formatDate(f.created_at as string)}</span>
          </span>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/franchises">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Link>
          </Button>
        }
      />

      <FranchiseDetailClient
        initial={{
          id: f.id as string,
          name: f.name as string,
          owner_name: f.owner_name as string,
          phone: f.phone as string,
          email: f.email as string,
          address: f.address as string,
          is_active: f.is_active as boolean,
          code: f.code as string,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>상품</Th>
                <Th>고객</Th>
                <Th>금액</Th>
                <Th>주문 일시</Th>
                <Th>상태</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(recentOrders ?? []).length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                    주문이 아직 없습니다.
                  </Td>
                </Tr>
              ) : (
                (recentOrders ?? []).map((o) => {
                  const status = o.status as OrderStatus;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pr = (o as any).products;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cu = (o as any).customers;
                  return (
                    <Tr key={o.id as string}>
                      <Td className="font-medium">{pr?.name ?? "-"}</Td>
                      <Td>{cu?.name ?? "-"}</Td>
                      <Td className="tabular-nums">{formatKRW(o.price as number)}</Td>
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
