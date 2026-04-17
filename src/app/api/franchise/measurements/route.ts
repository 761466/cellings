import { NextResponse } from "next/server";
import { requireFranchise } from "@/lib/auth/guard";

export async function GET(request: Request) {
  const { supabase, franchiseId } = await requireFranchise();
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  if (!customerId) return NextResponse.json({ data: [] });

  // 본인 매장 고객만
  const { data: cust } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("franchise_id", franchiseId)
    .maybeSingle();
  if (!cust) return NextResponse.json({ data: [] });

  const { data } = await supabase
    .from("measurements")
    .select("id, customer_id, scanned_at, data")
    .eq("customer_id", customerId)
    .order("scanned_at", { ascending: false });
  return NextResponse.json({ data: data ?? [] });
}
