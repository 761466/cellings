import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { GENDER_LABEL } from "@/lib/domain";
import type { Gender } from "@/lib/domain";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "고객" };

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { supabase, franchiseId } = await requireFranchise();
  const q = (searchParams.q ?? "").trim();

  let query = supabase
    .from("customers")
    .select("id, name, phone, gender, birth_year, created_at")
    .eq("franchise_id", franchiseId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data } = await query;
  const list = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="고객"
        description="스캔 이력과 주문 이력이 있는 고객을 관리합니다."
        actions={
          <Button asChild>
            <Link href="/franchise/customers/new">
              <Plus className="h-4 w-4" /> 신규 고객
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form method="get" className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="이름·연락처 검색"
              className="pl-9"
            />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="등록된 고객이 없습니다"
                description="첫 고객을 등록하면서 3D 스캔 값을 함께 입력하세요."
                action={
                  <Button asChild>
                    <Link href="/franchise/customers/new">
                      <Plus className="h-4 w-4" /> 신규 고객
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>이름</Th>
                  <Th>연락처</Th>
                  <Th>성별</Th>
                  <Th>출생</Th>
                  <Th>등록일</Th>
                </Tr>
              </Thead>
              <Tbody>
                {list.map((c) => (
                  <Tr key={c.id as string}>
                    <Td>
                      <Link
                        href={`/franchise/customers/${c.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.name as string}
                      </Link>
                    </Td>
                    <Td className="text-muted-foreground">
                      {c.phone as string}
                    </Td>
                    <Td>
                      {c.gender
                        ? GENDER_LABEL[c.gender as Gender]
                        : "-"}
                    </Td>
                    <Td className="text-muted-foreground">
                      {c.birth_year ? `${c.birth_year}` : "-"}
                    </Td>
                    <Td className="text-muted-foreground">
                      {formatDate(c.created_at as string)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
