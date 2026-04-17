import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireFranchise } from "@/lib/auth/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { OrderDetailClient } from "./order-detail-client";
import type {
  MeasurementData,
  OrderChoice,
  OrderStatus,
  MeasurementProfile,
} from "@/lib/domain";

export const metadata = { title: "주문 상세" };

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, franchiseId } = await requireFranchise();
  const { data } = await supabase
    .from("orders")
    .select(
      `
      id, price, quantity, status, product_type_selected, ordered_at, memo,
      products(name, category_slug, product_categories(name, measurement_profile)),
      customers(name, phone),
      measurements(id, scanned_at, data),
      franchises(name, code, phone, address)
      `,
    )
    .eq("id", params.id)
    .eq("franchise_id", franchiseId)
    .maybeSingle();
  if (!data) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;

  return (
    <div className="space-y-6">
      <PageHeader
        title="주문 상세"
        description={`${d.customers?.name ?? "-"} · ${d.products?.name ?? "-"}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/franchise/orders">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Link>
          </Button>
        }
      />
      <OrderDetailClient
        order={{
          id: d.id,
          price: d.price,
          quantity: d.quantity,
          status: d.status as OrderStatus,
          product_type_selected: d.product_type_selected as OrderChoice,
          ordered_at: d.ordered_at,
          memo: d.memo ?? null,
        }}
        franchise={{
          name: d.franchises?.name ?? "",
          code: d.franchises?.code ?? "",
          phone: d.franchises?.phone ?? "",
          address: d.franchises?.address ?? "",
        }}
        customer={{
          name: d.customers?.name ?? "",
          phone: d.customers?.phone ?? "",
        }}
        product={{
          name: d.products?.name ?? "",
          category_name: d.products?.product_categories?.name ?? null,
          category_slug: d.products?.category_slug ?? "",
          measurement_profile:
            (d.products?.product_categories?.measurement_profile ??
              "clothing") as MeasurementProfile,
        }}
        measurement={
          d.measurements
            ? {
                scanned_at: d.measurements.scanned_at,
                data: d.measurements.data as MeasurementData,
              }
            : null
        }
      />
    </div>
  );
}
