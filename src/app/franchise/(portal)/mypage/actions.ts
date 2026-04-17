"use server";

import { requireFranchise } from "@/lib/auth/guard";

export async function changePassword(newPassword: string) {
  const { supabase } = await requireFranchise();
  if (!newPassword || newPassword.length < 8)
    throw new Error("비밀번호는 8자 이상이어야 합니다.");
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}
