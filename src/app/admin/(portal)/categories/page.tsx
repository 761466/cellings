import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/table";
import { upsertCategory, deleteCategory } from "./actions";

export const metadata = { title: "카테고리" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("product_categories")
    .select("slug, name, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`카테고리 로드 실패: ${error.message}`);
  const list = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="카테고리"
        description="카테고리를 자유롭게 추가·비활성화합니다. 카테고리별 측정 항목은 템플릿으로 결정됩니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>카테고리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              const slug = String(formData.get("slug") ?? "").trim();
              const name = String(formData.get("name") ?? "").trim();
              const isActive = String(formData.get("is_active") ?? "on") === "on";
              const sortRaw = String(formData.get("sort_order") ?? "").trim();
              const sort = sortRaw === "" ? null : Number(sortRaw);
              await upsertCategory({
                slug,
                name,
                is_active: isActive,
                sort_order: Number.isNaN(sort as number) ? null : sort,
              });
            }}
            className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-end"
          >
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-muted-foreground">slug</label>
              <Input
                name="slug"
                placeholder="예: pillow-premium"
                required
                minLength={2}
                pattern="[A-Za-z0-9-]+"
              />
              <div className="mt-1 min-h-[14px] text-[11px] text-muted-foreground">
                영문/숫자/하이픈
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">표시명</label>
              <Input name="name" placeholder="예: 프리미엄 베개" required />
              <div className="mt-1 min-h-[14px] text-[11px] text-muted-foreground">
                {" "}
              </div>
            </div>
            <div className="md:col-span-2 flex items-end gap-2 pb-[14px]">
              <label className="inline-flex h-9 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked
                  className="h-4 w-4 rounded border-border"
                />
                활성
              </label>
              <Input name="sort_order" type="number" placeholder="정렬" className="w-24" />
              <Button type="submit">추가</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>slug</Th>
                <Th>표시명</Th>
                <Th>정렬</Th>
                <Th>상태</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {list.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="py-10 text-center text-muted-foreground">
                    카테고리가 없습니다.
                  </Td>
                </Tr>
              ) : (
                list.map((c) => (
                  <Tr key={c.slug as string}>
                    <Td className="font-mono text-xs">{c.slug as string}</Td>
                    <Td className="font-medium">{c.name as string}</Td>
                    <Td className="tabular-nums">{(c.sort_order as number | null) ?? "-"}</Td>
                    <Td>
                      {c.is_active ? (
                        <Badge variant="success">활성</Badge>
                      ) : (
                        <Badge variant="destructive">비활성</Badge>
                      )}
                    </Td>
                    <Td className="text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteCategory(c.slug as string);
                        }}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                        >
                          삭제
                        </Button>
                      </form>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

