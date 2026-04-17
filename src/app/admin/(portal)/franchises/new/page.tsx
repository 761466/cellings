import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { NewFranchiseForm } from "./new-franchise-form";

export const metadata = { title: "대리점 개설" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="대리점 개설"
        description="신규 대리점 계정과 정보를 생성합니다."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/franchises">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <NewFranchiseForm />
        </CardContent>
      </Card>
    </div>
  );
}
