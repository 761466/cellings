import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "오류",
  robots: { index: false, follow: false },
};

const REASON_MESSAGES: Record<string, string> = {
  no_code:
    "로그인 요청 정보가 올바르지 않습니다. 처음부터 다시 시도해 주세요.",
  token_failed:
    "카카오 로그인 처리에 실패했습니다. 잠시 후 다시 시도하거나, 카카오 앱 연락처·이름 제공 동의 여부를 확인해 주세요.",
  db_error:
    "서버에 연결하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function ScanErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason?.trim() ?? "";
  const message =
    REASON_MESSAGES[reason] ??
    "알 수 없는 오류가 발생했습니다. 처음부터 다시 시도해 주세요.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-destructive/30">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p className="text-foreground">{message}</p>
          {reason ? (
            <p className="text-xs text-muted-foreground/80">
              코드: {reason}
            </p>
          ) : null}
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
