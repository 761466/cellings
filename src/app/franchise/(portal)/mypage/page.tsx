import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { PasswordForm } from "./password-form";

export const metadata = { title: "내 정보" };

export default async function Page() {
  const { supabase, franchiseId } = await requireFranchise();
  const { data: f } = await supabase
    .from("franchises")
    .select("*")
    .eq("id", franchiseId)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="내 정보"
        description="대리점 정보와 계정 비밀번호를 관리합니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>대리점 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="대리점 코드" value={<span className="font-mono">{f?.code}</span>} />
            <Field label="대리점명" value={f?.name} />
            <Field label="점주명" value={f?.owner_name} />
            <Field label="연락처" value={f?.phone} />
            <Field label="이메일" value={f?.email} />
            <Field label="개설일" value={formatDate(f?.created_at as string)} />
            <div className="md:col-span-2">
              <div className="text-xs font-medium text-muted-foreground">주소</div>
              <div className="mt-1 text-sm">{f?.address}</div>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            대리점 기본 정보 변경은 본사 관리자에게 요청해 주세요.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value ?? "-"}</div>
    </div>
  );
}
