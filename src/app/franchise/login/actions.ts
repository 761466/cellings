"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export type FranchiseLoginState = {
  error?: string;
};

export async function loginFranchise(
  _prev: FranchiseLoginState,
  formData: FormData,
): Promise<FranchiseLoginState> {
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!code || !password) {
    return { error: "대리점 코드와 비밀번호를 입력해 주세요." };
  }

  let email: string;
  try {
    const svc = createServiceRoleClient();
    const { data: franchise, error: qErr } = await svc
      .from("franchises")
      .select("email")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (qErr || !franchise?.email) {
      return { error: "대리점 코드 또는 비밀번호가 올바르지 않습니다." };
    }
    email = franchise.email;
  } catch {
    return { error: "서버 설정을 확인해 주세요. (SUPABASE_SERVICE_ROLE_KEY)" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "대리점 코드 또는 비밀번호가 올바르지 않습니다." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인에 실패했습니다." };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role !== "franchise_admin") {
    await supabase.auth.signOut();
    return { error: "대리점 계정이 아닙니다." };
  }

  redirect("/franchise/dashboard");
}
