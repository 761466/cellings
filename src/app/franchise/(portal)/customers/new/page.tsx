import { PageHeader } from "@/components/ui/page-header";
import { NewCustomerForm } from "./new-customer-form";

export const metadata = { title: "신규 고객" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="신규 고객"
        description="고객 정보와 첫 3D 스캔 측정값을 함께 등록합니다."
      />
      <NewCustomerForm />
    </div>
  );
}
