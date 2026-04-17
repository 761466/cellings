import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../product-form";

export const metadata = { title: "상품 수정" };

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: categories }] = await Promise.all([
    supabase
    .from("products")
    .select("*, product_categories(name, measurement_profile)")
    .eq("id", params.id)
    .maybeSingle(),
    supabase
      .from("product_categories")
      .select("slug, name, measurement_profile, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 수정"
        description="저장 즉시 전 대리점 카탈로그에 반영됩니다."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Link>
          </Button>
        }
      />
      <ProductForm initial={data as never} categories={(categories ?? []) as never} />
    </div>
  );
}
