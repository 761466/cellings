"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { CategoryMeasurementView } from "@/components/measurements/category-measurement-view";
import { ScannerMeasurementView } from "@/components/measurements/scanner-measurement-view";
import {
  CATEGORY_LABEL,
  PRODUCT_TYPE_LABEL,
  type OrderChoice,
  type ProductCategory,
  type ProductType,
  type MeasurementData,
} from "@/lib/domain";
import { cn, formatDate, formatKRW } from "@/lib/utils";
import { createOrder } from "../actions";

type Customer = {
  id: string;
  name: string;
  phone: string;
};

type MeasurementRec = {
  id: string;
  customer_id: string;
  scanned_at: string;
  data: MeasurementData;
};

type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  product_type: ProductType;
  price_fixed: number | null;
  price_min: number | null;
  price_max: number | null;
  lead_time_days: number | null;
  thumbnail_url: string;
};

export function NewOrderClient({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const params = useSearchParams();
  const router = useRouter();

  const [custQ, setCustQ] = React.useState("");
  const [customerId, setCustomerId] = React.useState(
    params.get("customer") ?? "",
  );
  const [measurements, setMeasurements] = React.useState<MeasurementRec[]>([]);
  const [measurementId, setMeasurementId] = React.useState("");
  const [productId, setProductId] = React.useState(
    params.get("product") ?? "",
  );
  const [choice, setChoice] = React.useState<OrderChoice>("ready_made");
  const [quantity, setQuantity] = React.useState(1);
  const [price, setPrice] = React.useState<number | "">("");
  const [memo, setMemo] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // 고객 측정 이력 로드
  React.useEffect(() => {
    if (!customerId) {
      setMeasurements([]);
      setMeasurementId("");
      return;
    }
    (async () => {
      const res = await fetch(`/api/franchise/measurements?customer_id=${customerId}`);
      if (res.ok) {
        const j = (await res.json()) as { data: MeasurementRec[] };
        setMeasurements(j.data);
        if (j.data[0]) setMeasurementId(j.data[0].id);
      }
    })();
  }, [customerId]);

  const filteredCustomers = customers
    .filter(
      (c) =>
        !custQ ||
        c.name.toLowerCase().includes(custQ.toLowerCase()) ||
        c.phone.includes(custQ),
    )
    .slice(0, 30);

  const product = products.find((p) => p.id === productId);
  const measurement = measurements.find((m) => m.id === measurementId);

  // 선택 가능한 choice 옵션
  const choiceOptions = React.useMemo<OrderChoice[]>(() => {
    if (!product) return ["ready_made"];
    if (product.product_type === "ready_made") return ["ready_made"];
    if (product.product_type === "custom") return ["custom"];
    return ["ready_made", "custom"];
  }, [product]);

  React.useEffect(() => {
    if (!product) return;
    setChoice(choiceOptions[0]);
    if (product.product_type === "ready_made") {
      setPrice(product.price_fixed ?? 0);
    } else {
      setPrice("");
    }
  }, [product, choiceOptions]);

  const submit = async () => {
    if (!customerId) return toast.error("고객을 선택하세요.");
    if (!measurementId) return toast.error("적용할 측정값이 필요합니다.");
    if (!productId) return toast.error("상품을 선택하세요.");
    if (quantity < 1) return toast.error("수량은 1 이상.");
    const numericPrice = typeof price === "number" ? price : Number(price);
    if (!numericPrice || Number.isNaN(numericPrice))
      return toast.error("가격을 입력하세요.");
    try {
      setSaving(true);
      await createOrder({
        customer_id: customerId,
        measurement_id: measurementId,
        product_id: productId,
        quantity,
        price: numericPrice,
        product_type_selected: choice,
        memo: memo || undefined,
      });
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* 1. 고객 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 고객 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={custQ}
                onChange={(e) => setCustQ(e.target.value)}
                placeholder="고객명·연락처 검색"
                className="pl-9"
              />
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
              {filteredCustomers.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  일치하는 고객이 없습니다.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredCustomers.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setCustomerId(c.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                          customerId === c.id && "bg-muted",
                        )}
                      >
                        <span>
                          <span className="font-medium">{c.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {c.phone}
                          </span>
                        </span>
                        {customerId === c.id ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              새 고객이면{" "}
              <Link
                href="/franchise/customers/new"
                className="font-medium text-foreground underline"
              >
                고객 신규 등록
              </Link>{" "}
              후 돌아오세요.
            </div>
          </CardContent>
        </Card>

        {/* 2. 측정값 */}
        <Card>
          <CardHeader>
            <CardTitle>2. 적용 측정값</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!customerId ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                먼저 고객을 선택하세요.
              </div>
            ) : measurements.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                이 고객의 측정값이 없습니다. 고객 상세에서 재스캔 후 진행하세요.
              </div>
            ) : (
              <>
                <Select
                  value={measurementId}
                  onChange={(e) => setMeasurementId(e.target.value)}
                >
                  {measurements.map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      {idx === 0 ? "[최신] " : ""}
                      {formatDate(m.scanned_at)}
                    </option>
                  ))}
                </Select>
                {measurement ? (
                  product ? (
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <CategoryMeasurementView
                        category={product.category}
                        data={measurement.data}
                      />
                      <FullBodyToggle data={measurement.data} />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                      상품을 선택하면 제작에 필요한 측정값이 표시됩니다.
                    </div>
                  )
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        {/* 3. 상품 */}
        <Card>
          <CardHeader>
            <CardTitle>3. 상품 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProductId(p.id)}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-card text-left shadow-card transition-all",
                    productId === p.id
                      ? "border-foreground ring-2 ring-foreground/80"
                      : "border-border hover:-translate-y-0.5 hover:shadow-elevated",
                  )}
                >
                  <div className="aspect-square bg-muted">
                    {p.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnail_url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-1 p-2.5">
                    <div className="flex gap-1">
                      <Badge variant="outline">
                        {CATEGORY_LABEL[p.category]}
                      </Badge>
                      <Badge variant="accent">
                        {PRODUCT_TYPE_LABEL[p.product_type]}
                      </Badge>
                    </div>
                    <div className="truncate text-xs font-semibold">
                      {p.name}
                    </div>
                    <div className="text-xs tabular-nums text-foreground/80">
                      {p.product_type === "ready_made"
                        ? formatKRW(p.price_fixed ?? 0)
                        : `${formatKRW(p.price_min ?? 0)}~${formatKRW(p.price_max ?? 0)}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. 가격·옵션 */}
        <Card>
          <CardHeader>
            <CardTitle>4. 주문 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {choiceOptions.length > 1 ? (
              <div className="md:col-span-3">
                <Label>상품 유형 선택</Label>
                <div className="mt-2 flex gap-2">
                  {choiceOptions.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setChoice(o)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm",
                        choice === o
                          ? "border-foreground bg-foreground text-primary-foreground"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      {PRODUCT_TYPE_LABEL[o]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label required>수량</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label required>최종 가격 (원)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={
                  !!product && product.product_type === "ready_made"
                }
              />
              {product && product.product_type !== "ready_made" ? (
                <p className="text-xs text-muted-foreground">
                  참고가 {formatKRW(product.price_min ?? 0)} ~{" "}
                  {formatKRW(product.price_max ?? 0)}
                </p>
              ) : null}
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <Label>메모</Label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="요청사항·배송지·비고"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2 pb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/franchise/orders")}
          >
            <ArrowLeft className="h-4 w-4" /> 취소
          </Button>
          <Button loading={saving} onClick={submit}>
            <Save className="h-4 w-4" /> 주문 등록
          </Button>
        </div>
      </div>

      <div className="xl:sticky xl:top-8 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>주문 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label="고객"
              value={
                customers.find((c) => c.id === customerId)?.name ?? "-"
              }
            />
            <Row
              label="측정"
              value={
                measurement ? formatDate(measurement.scanned_at) : "-"
              }
            />
            <Row label="상품" value={product?.name ?? "-"} />
            <Row
              label="유형"
              value={product ? PRODUCT_TYPE_LABEL[choice] : "-"}
            />
            <Row label="수량" value={`${quantity}개`} />
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">합계</span>
              <span className="text-xl font-semibold tabular-nums">
                {price && product
                  ? formatKRW(Number(price) * quantity)
                  : "-"}
              </span>
            </div>
            {product && product.product_type !== "ready_made" && product.lead_time_days ? (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                제작 소요 약 {product.lead_time_days}일 예상
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function FullBodyToggle({ data }: { data: MeasurementData }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-4 border-t border-border/70 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-foreground/80 underline underline-offset-4"
      >
        {open ? "전체 스캐너 데이터 접기" : "전체 스캐너 데이터 펼치기"}
      </button>
      {open ? (
        <div className="mt-3">
          <ScannerMeasurementView data={data} />
        </div>
      ) : null}
    </div>
  );
}
