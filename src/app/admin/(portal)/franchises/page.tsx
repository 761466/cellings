import Link from "next/link";
import { Plus, Search, Store } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "대리점" };

export default async function AdminFranchisesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const { supabase } = await requireAdmin();
  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status ?? "all";

  let query = supabase
    .from("franchises")
    .select("id, code, name, owner_name, phone, address, is_active, created_at")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,owner_name.ilike.%${q}%,code.ilike.%${q}%`,
    );
  }
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);

  const { data } = await query;
  const list = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="대리점"
        description="등록된 전체 대리점을 조회·관리합니다."
        actions={
          <Button asChild>
            <Link href="/admin/franchises/new">
              <Plus className="h-4 w-4" /> 대리점 개설
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap items-center gap-2" action="" method="get">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="대리점명·점주·코드 검색"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 text-xs">
              {[
                { v: "all", l: "전체" },
                { v: "active", l: "활성" },
                { v: "inactive", l: "비활성" },
              ].map((t) => (
                <Link
                  key={t.v}
                  href={`/admin/franchises?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    status: t.v,
                  }).toString()}`}
                  className={
                    status === t.v
                      ? "rounded-md bg-foreground px-3 py-1 text-primary-foreground"
                      : "rounded-md px-3 py-1 text-muted-foreground hover:text-foreground"
                  }
                >
                  {t.l}
                </Link>
              ))}
            </div>
            <Button type="submit" variant="outline" size="sm">
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Store className="h-5 w-5" />}
                title="대리점이 없습니다"
                description="우측 상단의 ‘대리점 개설’ 버튼으로 첫 대리점을 만드세요."
                action={
                  <Button asChild>
                    <Link href="/admin/franchises/new">
                      <Plus className="h-4 w-4" /> 대리점 개설
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>코드</Th>
                  <Th>대리점</Th>
                  <Th>점주</Th>
                  <Th>연락처</Th>
                  <Th>주소</Th>
                  <Th>개설일</Th>
                  <Th>상태</Th>
                </Tr>
              </Thead>
              <Tbody>
                {list.map((f) => (
                  <Tr key={f.id}>
                    <Td className="font-mono text-xs">{f.code}</Td>
                    <Td>
                      <Link
                        href={`/admin/franchises/${f.id}`}
                        className="font-medium hover:underline"
                      >
                        {f.name}
                      </Link>
                    </Td>
                    <Td>{f.owner_name}</Td>
                    <Td className="text-muted-foreground">{f.phone}</Td>
                    <Td className="max-w-[280px] truncate text-muted-foreground">
                      {f.address}
                    </Td>
                    <Td className="text-muted-foreground">
                      {formatDate(f.created_at as string)}
                    </Td>
                    <Td>
                      {f.is_active ? (
                        <Badge variant="success">활성</Badge>
                      ) : (
                        <Badge variant="destructive">비활성</Badge>
                      )}
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
