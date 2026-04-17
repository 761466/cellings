import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../product-form";

export const metadata = { title: "상품 추가" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 추가"
        description="기본정보·썸네일·상세 블록을 구성해 등록합니다."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Link>
          </Button>
        }
      />
      <ProductForm />
    </div>
  );
}
