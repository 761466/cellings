"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { createServiceRoleClient } from "@/lib/supabase/service";
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
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999).nullable(),
});

export async function upsertCategory(payload: {
  slug: string;
  name: string;
  is_active: boolean;
  sort_order: number | null;
}) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const normalized = {
    ...payload,
    slug: payload.slug.trim().toLowerCase(),
    name: payload.name.trim(),
  };
  const parsed = schema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => {
        const path = i.path.join(".") || "value";
        return `${path}: ${i.message}`;
      })
      .join(" / ");
    throw new Error(`입력값을 확인해 주세요. (${msg})`);
  }

  const { error } = await svc.from("product_categories").upsert({
    slug: parsed.data.slug,
    name: parsed.data.name,
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

