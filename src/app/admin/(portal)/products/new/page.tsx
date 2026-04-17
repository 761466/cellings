import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../product-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata = { title: "상품 추가" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase
    .from("product_categories")
    .select("slug, name, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`카테고리 로드 실패: ${error.message}`);
  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 추가"
        description="기본정보·썸네일·상세 블록을 구성해 등록합니다."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Link>
          </Button>
        }
      />
      <ProductForm categories={(categories ?? []) as never} />
    </div>
  );
}
