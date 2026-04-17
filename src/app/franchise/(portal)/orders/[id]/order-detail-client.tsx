"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { CategoryMeasurementView } from "@/components/measurements/category-measurement-view";
import { ScannerMeasurementView } from "@/components/measurements/scanner-measurement-view";
import {
  PROFILE_MEASUREMENT_KEYS,
  CHOICE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  MEASUREMENT_META,
  categoryLabel,
  formatMeasurementValue,
  type OrderStatus,
  type OrderChoice,
  type MeasurementProfile,
  type MeasurementData,
} from "@/lib/domain";
import { formatDate, formatDateTime, formatKRW } from "@/lib/utils";
import { updateOrderMemo, updateOrderStatus } from "../actions";
import type { OrderPdfProps } from "@/components/pdf/order-pdf";

const PdfDownload = dynamic(
  () => import("@/components/pdf/order-pdf-download").then((m) => m.OrderPdfDownload),
  { ssr: false, loading: () => null },
);

export function OrderDetailClient({
  order,
  franchise,
  customer,
  product,
  measurement,
}: {
  order: {
    id: string;
    price: number;
    quantity: number;
    status: OrderStatus;
    product_type_selected: OrderChoice;
    ordered_at: string;
    memo: string | null;
  };
  franchise: { name: string; code: string; phone: string; address: string };
  customer: { name: string; phone: string };
  product: {
    name: string;
    category_slug: string;
    category_name: string | null;
    measurement_profile: MeasurementProfile;
  };
  measurement: { scanned_at: string; data: MeasurementData } | null;
}) {
  const [status, setStatus] = React.useState<OrderStatus>(order.status);
  const [memo, setMemo] = React.useState(order.memo ?? "");
  const [busy, setBusy] = React.useState(false);
  const [showFullBody, setShowFullBody] = React.useState(false);

  const next: OrderStatus | null =
    status === "pending"
      ? "confirmed"
      : status === "confirmed"
        ? "producing"
        : status === "producing"
          ? "done"
          : null;
  const nextLabel =
    next === "confirmed"
      ? "접수확인"
      : next === "producing"
        ? "제작중으로 변경"
        : next === "done"
          ? "완료 처리"
          : null;

  const measurementRows = measurement
    ? PROFILE_MEASUREMENT_KEYS[product.measurement_profile].map((k) => {
        const meta = MEASUREMENT_META[k];
        const v = measurement.data[k];
        const sidePrefix = meta?.side
          ? meta.side === "left"
            ? "[왼발] "
            : "[오른발] "
          : "";
        return {
          key: k,
          label: `${sidePrefix}${meta?.label ?? k}`,
          value:
            v != null && v !== ""
              ? formatMeasurementValue(v, meta?.unit ?? "text")
              : "-",
        };
      })
    : [];

  const pdfProps: OrderPdfProps = {
    order: {
      id: order.id,
      price: order.price,
      quantity: order.quantity,
      status: STATUS_LABEL[order.status],
      product_type_selected: CHOICE_LABEL[order.product_type_selected],
      ordered_at: formatDateTime(order.ordered_at),
      memo: memo || null,
    },
    franchise,
    customer,
    product: {
      name: product.name,
      category: product.category_name ?? categoryLabel(product.category_slug),
    },
    measurements: measurementRows,
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div>
              <div className="text-xs text-muted-foreground">주문번호</div>
              <div className="font-mono">{order.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <Badge variant={STATUS_COLOR[status] as never}>
              {STATUS_LABEL[status]}
            </Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="고객" value={customer.name} />
            <Field label="연락처" value={customer.phone} />
            <Field label="상품" value={product.name} />
            <Field
              label="유형"
              value={CHOICE_LABEL[order.product_type_selected]}
            />
            <Field label="수량" value={`${order.quantity}개`} />
            <Field
              label="합계"
              value={formatKRW(order.price * order.quantity)}
            />
            <Field label="주문 일시" value={formatDateTime(order.ordered_at)} />
            <Field
              label="측정일"
              value={measurement ? formatDate(measurement.scanned_at) : "-"}
            />
          </CardContent>
        </Card>

        {measurement ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle>
                제작 측정값 · {product.category_name ?? categoryLabel(product.category_slug)}
              </CardTitle>
              <button
                type="button"
                onClick={() => setShowFullBody((v) => !v)}
                className="text-xs font-medium text-foreground/80 underline underline-offset-4"
              >
                {showFullBody
                  ? "전체 스캐너 데이터 접기"
                  : "전체 스캐너 데이터 펼치기"}
              </button>
            </CardHeader>
            <CardContent className="space-y-5">
              <CategoryMeasurementView
                profile={product.measurement_profile}
                categoryName={product.category_name ?? categoryLabel(product.category_slug)}
                data={measurement.data}
              />
              {showFullBody ? (
                <div className="border-t border-border pt-4">
                  <ScannerMeasurementView data={measurement.data} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>메모</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="요청사항·배송지·비고"
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                loading={busy}
                onClick={async () => {
                  try {
                    setBusy(true);
                    await updateOrderMemo(order.id, memo);
                    toast.success("저장되었습니다.");
                  } catch (e) {
                    toast.error((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Save className="h-4 w-4" /> 메모 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="xl:sticky xl:top-8 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>진행 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="relative space-y-3 border-l-2 border-border pl-4">
              {(["pending", "confirmed", "producing", "done"] as OrderStatus[]).map(
                (s, i) => {
                  const order2 = ["pending", "confirmed", "producing", "done"];
                  const idx = order2.indexOf(status);
                  const reached = i <= idx;
                  return (
                    <li key={s} className="relative">
                      <span
                        className={
                          "absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full border-2 " +
                          (reached
                            ? "border-foreground bg-foreground"
                            : "border-border bg-background")
                        }
                      />
                      <div className="text-sm font-medium">
                        {STATUS_LABEL[s]}
                      </div>
                    </li>
                  );
                },
              )}
            </ol>

            {next && nextLabel ? (
              <Button
                className="w-full"
                loading={busy}
                onClick={async () => {
                  try {
                    setBusy(true);
                    await updateOrderStatus(order.id, next);
                    setStatus(next);
                    toast.success(`${STATUS_LABEL[next]} 로 변경되었습니다.`);
                  } catch (e) {
                    toast.error((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> {nextLabel}
              </Button>
            ) : (
              <div className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                완료된 주문입니다.
              </div>
            )}

            <PdfDownload {...pdfProps} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
