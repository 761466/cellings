"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "코드는 2자 이상")
    .regex(/^[A-Za-z0-9_-]+$/u, "영문/숫자/-_만 사용하세요"),
  name: z.string().trim().min(1, "대리점명 필수"),
  owner_name: z.string().trim().min(1, "점주명 필수"),
  phone: z.string().trim().min(1, "연락처 필수"),
  email: z.string().trim().email("이메일 형식 오류"),
  address: z.string().trim().min(1, "주소 필수"),
  initial_password: z.string().min(8, "8자 이상"),
});

export type FranchiseActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  newId?: string;
};

export async function createFranchise(
  _prev: FranchiseActionState,
  formData: FormData,
): Promise<FranchiseActionState> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    owner_name: formData.get("owner_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    initial_password: formData.get("initial_password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      fieldErrors[i.path[0] as string] = i.message;
    });
    return { error: "입력값을 확인해 주세요.", fieldErrors };
  }

  const payload = parsed.data;
  const svc = createServiceRoleClient();

  // 0) 중복 검사 (이메일·코드)
  const { data: dupe } = await svc
    .from("franchises")
    .select("id")
    .or(`code.eq.${payload.code},email.eq.${payload.email}`)
    .maybeSingle();
  if (dupe) {
    return { error: "이미 등록된 대리점 코드 또는 이메일입니다." };
  }

  // 1) Auth 사용자 생성
  const { data: userRes, error: userErr } = await svc.auth.admin.createUser({
    email: payload.email,
    password: payload.initial_password,
    email_confirm: true,
    user_metadata: { role: "franchise_admin", code: payload.code },
  });
  if (userErr || !userRes.user) {
    return {
      error: `계정 생성 실패: ${userErr?.message ?? "알 수 없는 오류"}`,
    };
  }
  const authUserId = userRes.user.id;

  // 2) franchises + user_profiles
  const { data: inserted, error: fErr } = await svc
    .from("franchises")
    .insert({
      code: payload.code,
      name: payload.name,
      owner_name: payload.owner_name,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      auth_user_id: authUserId,
      is_active: true,
    })
    .select("id")
    .single();

  if (fErr || !inserted) {
    await svc.auth.admin.deleteUser(authUserId).catch(() => {});
    return { error: `대리점 저장 실패: ${fErr?.message ?? ""}` };
  }

  const { error: pErr } = await svc.from("user_profiles").insert({
    user_id: authUserId,
    role: "franchise_admin",
    franchise_id: inserted.id,
  });
  if (pErr) {
    await svc.from("franchises").delete().eq("id", inserted.id);
    await svc.auth.admin.deleteUser(authUserId).catch(() => {});
    return { error: `프로필 저장 실패: ${pErr.message}` };
  }

  revalidatePath("/admin/franchises");
  redirect(`/admin/franchises/${inserted.id}`);
}

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  owner_name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().email(),
  address: z.string().trim().min(1),
});

export async function updateFranchise(
  _prev: FranchiseActionState,
  formData: FormData,
): Promise<FranchiseActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    owner_name: formData.get("owner_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
  });
  if (!parsed.success) {
    return { error: "입력값을 확인해 주세요." };
  }
  const svc = createServiceRoleClient();
  // 이메일 변경 시 auth email 도 변경
  const { data: fr } = await svc
    .from("franchises")
    .select("auth_user_id, email")
    .eq("id", parsed.data.id)
    .single();
  if (fr?.auth_user_id && fr.email !== parsed.data.email) {
    await svc.auth.admin.updateUserById(fr.auth_user_id, {
      email: parsed.data.email,
    });
  }
  const { error } = await svc
    .from("franchises")
    .update({
      name: parsed.data.name,
      owner_name: parsed.data.owner_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      address: parsed.data.address,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/franchises/${parsed.data.id}`);
  return { ok: true };
}

export async function toggleFranchiseActive(id: string, next: boolean) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  await svc.from("franchises").update({ is_active: next }).eq("id", id);
  revalidatePath(`/admin/franchises/${id}`);
  revalidatePath("/admin/franchises");
}

export async function sendPasswordResetLink(email: string) {
  await requireAdmin();
  const svc = createServiceRoleClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  await svc.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/franchise/login`,
  });
}
