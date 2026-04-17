"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { DetailBlock } from "@/lib/types";
import type {
  ProductType,
} from "@/lib/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProductPayload = {
  id?: string;
  name: string;
  category_slug: string;
  product_type: ProductType;
  thumbnail_url: string;
  detail_blocks: DetailBlock[];
  price_fixed: number | null;
  price_min: number | null;
  price_max: number | null;
  lead_time_days: number | null;
  is_active: boolean;
  sort_order: number | null;
};

export async function saveProduct(payload: ProductPayload) {
  await requireAdmin();
  const svc = createServiceRoleClient();

  if (!payload.name.trim()) throw new Error("상품명은 필수입니다.");
  if (!payload.thumbnail_url) throw new Error("썸네일이 필요합니다.");
  if (!payload.category_slug) throw new Error("카테고리를 선택해 주세요.");
  if (payload.product_type === "ready_made") {
    if (!payload.price_fixed)
      throw new Error("기성품은 확정가가 필요합니다.");
    payload.price_min = null;
    payload.price_max = null;
    payload.lead_time_days = null;
  }
  if (payload.product_type === "custom" || payload.product_type === "both") {
    if (!payload.price_min || !payload.price_max)
      throw new Error("커스텀/복합은 참고 가격 범위가 필요합니다.");
    if (payload.price_min > payload.price_max)
      throw new Error("최소가가 최대가보다 클 수 없습니다.");
    if (!payload.lead_time_days)
      throw new Error("커스텀/복합은 리드타임이 필요합니다.");
  }
  if (payload.product_type === "custom") payload.price_fixed = null;

  const dto = {
    name: payload.name.trim(),
    category_slug: payload.category_slug,
    product_type: payload.product_type,
    thumbnail_url: payload.thumbnail_url,
    detail_blocks: payload.detail_blocks,
    price_fixed: payload.price_fixed,
    price_min: payload.price_min,
    price_max: payload.price_max,
    lead_time_days: payload.lead_time_days,
    is_active: payload.is_active,
    sort_order: payload.sort_order,
  };

  if (payload.id) {
    const { error } = await svc.from("products").update(dto).eq("id", payload.id);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/products/${payload.id}`);
    revalidatePath("/admin/products");
    revalidatePath("/franchise/catalog");
    return { id: payload.id };
  }
  const { data, error } = await svc
    .from("products")
    .insert(dto)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/franchise/catalog");
  return { id: data.id as string };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const { error } = await svc.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProductActive(id: string, next: boolean) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  await svc.from("products").update({ is_active: next }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/franchise/catalog");
}

export async function createSignedUploadUrl(path: string) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const { data, error } = await svc.storage
    .from("product-assets")
    .createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  return data; // { signedUrl, token, path }
}

export async function createSignedDownloadUrl(path: string) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const { data } = await svc.storage
    .from("product-assets")
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7일
  return data?.signedUrl ?? null;
}
