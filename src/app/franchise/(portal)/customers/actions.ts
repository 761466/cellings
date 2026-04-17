"use server";

import { requireFranchise } from "@/lib/auth/guard";
import type { Gender, MeasurementData } from "@/lib/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().trim().min(1, "이름 필수"),
  phone: z.string().trim().min(1, "연락처 필수"),
  gender: z.enum(["m", "f", "other"]).optional(),
  birth_year: z.number().int().min(1900).max(2100).optional(),
  memo: z.string().optional(),
  privacy_agreed: z.boolean(),
});

export async function createCustomerWithMeasurement(payload: {
  customer: {
    name: string;
    phone: string;
    gender?: Gender;
    birth_year?: number;
    memo?: string;
    privacy_agreed: boolean;
  };
  measurement: {
    scanned_at: string;
    data: MeasurementData;
    memo?: string;
  } | null;
}) {
  const { supabase, franchiseId } = await requireFranchise();

  const parsed = customerSchema.safeParse(payload.customer);
  if (!parsed.success) throw new Error("입력값을 확인해 주세요.");
  if (!parsed.data.privacy_agreed)
    throw new Error("개인정보 수집·이용 동의가 필요합니다.");

  const { data: c, error: cErr } = await supabase
    .from("customers")
    .insert({
      franchise_id: franchiseId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      gender: parsed.data.gender ?? null,
      birth_year: parsed.data.birth_year ?? null,
      memo: parsed.data.memo ?? null,
      privacy_agreed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (cErr || !c) throw new Error(cErr?.message ?? "고객 등록 실패");

  if (payload.measurement) {
    await supabase.from("measurements").insert({
      customer_id: c.id,
      scanned_at: payload.measurement.scanned_at,
      data: payload.measurement.data,
      memo: payload.measurement.memo ?? null,
    });
  }

  revalidatePath("/franchise/customers");
  redirect(`/franchise/customers/${c.id}`);
}

export async function updateCustomer(
  id: string,
  payload: {
    name: string;
    phone: string;
    gender?: Gender;
    birth_year?: number;
    memo?: string;
  },
) {
  const { supabase } = await requireFranchise();
  const { error } = await supabase
    .from("customers")
    .update({
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      gender: payload.gender ?? null,
      birth_year: payload.birth_year ?? null,
      memo: payload.memo ?? null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/franchise/customers/${id}`);
}

export async function softDeleteCustomer(id: string) {
  const { supabase } = await requireFranchise();
  const { error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/franchise/customers");
  redirect("/franchise/customers");
}

export async function addMeasurement(
  customerId: string,
  payload: {
    scanned_at: string;
    data: MeasurementData;
    memo?: string;
  },
) {
  const { supabase } = await requireFranchise();
  const { error } = await supabase.from("measurements").insert({
    customer_id: customerId,
    scanned_at: payload.scanned_at,
    data: payload.data,
    memo: payload.memo ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/franchise/customers/${customerId}`);
}
