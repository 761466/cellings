import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { NewOrderClient } from "./new-order-client";

export const metadata = { title: "주문 등록" };

export default async function Page() {
  const { supabase, franchiseId } = await requireFranchise();
  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone")
      .eq("franchise_id", franchiseId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("products")
      .select(
        "id, name, category, product_type, price_fixed, price_min, price_max, lead_time_days, thumbnail_url",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="주문 등록"
        description="고객 → 측정값 → 상품 → 가격 순으로 입력해 주문을 생성합니다."
      />
      <NewOrderClient
        customers={(customers ?? []) as never}
        products={(products ?? []) as never}
      />
    </div>
  );
}
