import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/domain";
import type { OrderStatus } from "@/lib/domain";
import { formatDateTime, formatKRW } from "@/lib/utils";
import { CustomerClient } from "./customer-client";
import type { Measurement } from "@/lib/types";

export const metadata = { title: "고객 상세" };

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, franchiseId } = await requireFranchise();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("franchise_id", franchiseId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer) notFound();

  const [{ data: measurements }, { data: orders }] = await Promise.all([
    supabase
      .from("measurements")
      .select("*")
      .eq("customer_id", params.id)
      .order("scanned_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, price, status, ordered_at, products(name)",
      )
      .eq("customer_id", params.id)
      .order("ordered_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name as string}
        description={`고객 정보·측정·주문 이력 · ${customer.phone}`}
        actions={
          <Button asChild>
            <Link href={`/franchise/orders/new?customer=${customer.id}`}>
              주문 등록
            </Link>
          </Button>
        }
      />

      <CustomerClient
        customer={{
          id: customer.id as string,
          name: customer.name as string,
          phone: customer.phone as string,
          gender: (customer.gender ?? null) as Measurement["id"] | null as never,
          birth_year: (customer.birth_year ?? null) as number | null,
          memo: (customer.memo ?? null) as string | null,
          privacy_agreed_at: customer.privacy_agreed_at as string,
          created_at: customer.created_at as string,
        }}
        measurements={(measurements ?? []) as Measurement[]}
      />

      <Card>
        <CardHeader>
          <CardTitle>주문 이력 ({orders?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>상품</Th>
                <Th>금액</Th>
                <Th>주문 일시</Th>
                <Th>상태</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(orders ?? []).length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="py-10 text-center text-muted-foreground">
                    주문 이력이 없습니다.
                  </Td>
                </Tr>
              ) : (
                (orders ?? []).map((o) => {
                  const status = o.status as OrderStatus;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pr = (o as any).products;
                  return (
                    <Tr key={o.id as string}>
                      <Td>
                        <Link
                          href={`/franchise/orders/${o.id}`}
                          className="font-medium hover:underline"
                        >
                          {pr?.name ?? "-"}
                        </Link>
                      </Td>
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
