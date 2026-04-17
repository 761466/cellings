import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  user_id: string;
  role: "super_admin" | "franchise_admin";
  franchise_id: string | null;
};

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, role, franchise_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    user_id: data.user_id,
    role: data.role as UserProfile["role"],
    franchise_id: data.franchise_id,
  };
}
