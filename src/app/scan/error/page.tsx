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
  kakao_denied:
    "카카오 로그인이 취소되었거나 동의가 거절되었습니다. 다시 시도할 때 필요한 항목에 동의해 주세요.",
  kakao_oauth:
    "카카오 인증 코드로 토큰을 받지 못했습니다. QR에 연결된 주소의 Redirect URI가 카카오 개발자 콘솔·서버 환경변수(KAKAO_REDIRECT_URI)와 정확히 같은지, 같은 인증을 두 번 누르지 않았는지 확인해 주세요.",
  kakao_user:
    "카카오에서 회원 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
  kakao_phone:
    "카카오 계정에 등록된 휴대전화 번호를 받지 못했습니다. (현재 서비스는 이메일·닉네임만 사용하는 경우 이 메시지는 사용되지 않습니다.)",
  kakao_email:
    "카카오 계정 이메일을 받지 못했습니다. 카카오 개발자 콘솔에서「카카오계정(이메일)」동의 항목을 사용하도록 설정하고, 로그인 요청 URL의 scope에 account_email(또는 이메일)이 포함되어 있는지 확인해 주세요.",
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
