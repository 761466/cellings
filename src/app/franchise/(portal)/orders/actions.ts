"use server";

import { requireFranchise } from "@/lib/auth/guard";
import type { OrderChoice, OrderStatus, ProductType } from "@/lib/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createSchema = z.object({
  customer_id: z.string().uuid(),
  measurement_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  price: z.number().int().min(0),
  product_type_selected: z.enum(["ready_made", "custom"]),
  memo: z.string().optional(),
});

export async function createOrder(payload: {
  customer_id: string;
  measurement_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_type_selected: OrderChoice;
  memo?: string;
}) {
  const { supabase, franchiseId } = await requireFranchise();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  // 상품 정보 스냅샷 확인
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select(
      "id, product_type, is_active, price_fixed, price_min, price_max",
    )
    .eq("id", parsed.data.product_id)
    .maybeSingle();
  if (pErr || !product) throw new Error("상품을 찾을 수 없습니다.");
  if (!product.is_active) throw new Error("비활성 상품은 주문할 수 없습니다.");

  const productType = product.product_type as ProductType;
  if (
    productType === "ready_made" &&
    parsed.data.product_type_selected !== "ready_made"
  )
    throw new Error("기성품은 기성품 선택만 가능합니다.");
  if (
    productType === "custom" &&
    parsed.data.product_type_selected !== "custom"
  )
    throw new Error("커스텀은 커스텀 선택만 가능합니다.");

  // 복합 유형일 때 가격 범위 가이드(경고 아님, 수용)

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      franchise_id: franchiseId,
      customer_id: parsed.data.customer_id,
      measurement_id: parsed.data.measurement_id,
      product_id: parsed.data.product_id,
      quantity: parsed.data.quantity,
      price: parsed.data.price,
      product_type: productType,
      product_type_selected: parsed.data.product_type_selected,
      memo: parsed.data.memo ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !order) throw new Error(error?.message ?? "주문 저장 실패");

  revalidatePath("/franchise/orders");
  redirect(`/franchise/orders/${order.id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { supabase } = await requireFranchise();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/franchise/orders/${id}`);
  revalidatePath("/franchise/orders");
}

export async function updateOrderMemo(id: string, memo: string) {
  const { supabase } = await requireFranchise();
  const { error } = await supabase
    .from("orders")
    .update({ memo })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/franchise/orders/${id}`);
}
