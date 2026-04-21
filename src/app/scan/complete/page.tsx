import { createServiceRoleClient } from "@/lib/supabase/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "스캔 준비 완료",
  robots: { index: false, follow: false },
};

export default async function ScanCompletePage({
  searchParams,
}: {
  searchParams: { customer_id?: string };
}) {
  const customerId = searchParams.customer_id?.trim();

  let customerName = "고객";
  if (customerId) {
    try {
      const supabase = createServiceRoleClient();
      const { data } = await supabase
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .is("deleted_at", null)
        .maybeSingle();
      if (data?.name) customerName = data.name;
    } catch {
      /* 이름 조회 실패 시 기본 문구 유지 */
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">스캔 준비 완료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="text-base text-foreground">
            <span className="font-medium text-foreground">{customerName}</span>
            님, 준비가 완료되었습니다.
          </p>
          <p>이제 매장 안내에 따라 스캔을 진행해 주세요.</p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            홈으로
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
