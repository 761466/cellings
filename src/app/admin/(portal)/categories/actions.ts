"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { MeasurementProfile } from "@/lib/domain";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/i, "영문/숫자/하이픈만 가능"),
  name: z.string().trim().min(1).max(40),
  measurement_profile: z.enum(["pillow", "shoes", "clothing", "shapewear"]),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999).nullable(),
});

export async function upsertCategory(payload: {
  slug: string;
  name: string;
  measurement_profile: MeasurementProfile;
  is_active: boolean;
  sort_order: number | null;
}) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");

  const { error } = await svc.from("product_categories").upsert({
    slug: parsed.data.slug,
    name: parsed.data.name,
    measurement_profile: parsed.data.measurement_profile,
    is_active: parsed.data.is_active,
    sort_order: parsed.data.sort_order,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/franchise/catalog");
}

export async function deleteCategory(slug: string) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const { error } = await svc.from("product_categories").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/franchise/catalog");
}

