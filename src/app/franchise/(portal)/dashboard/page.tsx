import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth/profile";

export default async function FranchiseDashboardPage() {
  const profile = await getUserProfile();
  const supabase = await createClient();

  let franchiseName = "";
  if (profile?.franchise_id) {
    const { data } = await supabase
      .from("franchises")
      .select("name, code")
      .eq("id", profile.franchise_id)
      .maybeSingle();
    if (data) {
      franchiseName = `${data.name} (${data.code})`;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
      {franchiseName ? (
        <p className="mt-2 text-slate-600">{franchiseName}</p>
      ) : null}
      <p className="mt-4 text-slate-600">
        오늘·이번 달 KPI와 최근 주문은 다음 단계에서 연결합니다.
      </p>
    </div>
  );
}
