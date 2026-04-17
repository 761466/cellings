import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, ShoppingCart } from "lucide-react";
import { requireFranchise } from "@/lib/auth/guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_LABEL,
  PRODUCT_TYPE_LABEL,
  type ProductCategory,
  type ProductType,
} from "@/lib/domain";
import { formatKRW } from "@/lib/utils";
import { ProductDetailView } from "@/components/product/product-detail-view";
import type { DetailBlock } from "@/lib/types";

export const metadata = { title: "상품 브로셔" };

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireFranchise();
  const { data: p } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!p) notFound();

  return (
    <div className="print-page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 no-print">
        <Button asChild variant="outline" size="sm">
          <Link href="/franchise/catalog">
            <ArrowLeft className="h-4 w-4" /> 카탈로그
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a
              href={`#print`}
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") window.print();
              }}
            >
              <Printer className="h-4 w-4" /> 인쇄
            </a>
          </Button>
          <Button asChild>
            <Link href={`/franchise/orders/new?product=${p.id}`}>
              <ShoppingCart className="h-4 w-4" /> 이 상품 주문
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-8 p-6 md:grid-cols-[1.1fr_1fr]">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {p.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.thumbnail_url as string}
                alt={p.name as string}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline">
                {CATEGORY_LABEL[p.category as ProductCategory]}
              </Badge>
              <Badge variant="accent">
                {PRODUCT_TYPE_LABEL[p.product_type as ProductType]}
              </Badge>
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight">
              {p.name as string}
            </h1>
            <div className="text-2xl font-semibold tabular-nums">
              {p.product_type === "ready_made"
                ? formatKRW(p.price_fixed as number)
                : `${formatKRW(p.price_min as number)} ~ ${formatKRW(
                    p.price_max as number,
                  )}`}
            </div>
            {p.product_type !== "ready_made" && p.lead_time_days ? (
              <p className="text-sm text-muted-foreground">
                제작 소요 기간 약 {p.lead_time_days}일
              </p>
            ) : null}
            <div className="mt-auto flex gap-2 pt-2 no-print">
              <Button asChild size="lg">
                <Link href={`/franchise/orders/new?product=${p.id}`}>
                  <ShoppingCart className="h-4 w-4" /> 주문 진행
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6 md:p-10">
          <ProductDetailView
            blocks={((p.detail_blocks as unknown) as DetailBlock[]) ?? []}
            className="mx-auto max-w-3xl"
          />
        </CardContent>
      </Card>
    </div>
  );
}
