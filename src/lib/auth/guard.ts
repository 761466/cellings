import { createClient } from "@/lib/supabase/server";
import { getUserProfile, type UserProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireAdmin(): Promise<{
  profile: UserProfile;
  supabase: SupabaseClient;
}> {
  const profile = await getUserProfile();
  if (!profile) redirect("/admin/login");
  if (profile.role !== "super_admin") redirect("/franchise/dashboard");
  const supabase = await createClient();
  return { profile, supabase };
}

export async function requireFranchise(): Promise<{
  profile: UserProfile;
  supabase: SupabaseClient;
  franchiseId: string;
}> {
  const profile = await getUserProfile();
  if (!profile) redirect("/franchise/login");
  if (profile.role !== "franchise_admin" || !profile.franchise_id) {
    redirect("/admin/dashboard");
  }
  const supabase = await createClient();
  return { profile, supabase, franchiseId: profile.franchise_id! };
}
