"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  ImagePlus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  PRODUCT_TYPE_OPTIONS,
  categoryLabel,
  type ProductType,
  PRODUCT_TYPE_LABEL,
} from "@/lib/domain";
import type { DetailBlock, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { BlockEditor } from "@/components/product/block-editor";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { deleteProduct, saveProduct } from "./actions";
import { uploadProductAsset } from "@/lib/storage";
import { formatKRW } from "@/lib/utils";

type FormState = {
  id?: string;
  name: string;
  category_slug: string;
  category_name?: string | null;
  product_type: ProductType;
  thumbnail_url: string;
  detail_blocks: DetailBlock[];
  price_fixed: number | "";
  price_min: number | "";
  price_max: number | "";
  lead_time_days: number | "";
  is_active: boolean;
  sort_order: number | "";
};

export function ProductForm({
  initial,
  categories,
}: {
  initial?: Partial<Product>;
  categories: Array<{
    slug: string;
    name: string;
    is_active: boolean;
    sort_order: number | null;
  }>;
}) {
  const router = useRouter();
  const initialJoin =
    (initial as Partial<Product> & {
      product_categories?: { name?: string | null } | null;
    })?.product_categories ?? null;
  const [state, setState] = React.useState<FormState>({
    id: initial?.id,
    name: initial?.name ?? "",
    category_slug: (initial?.category_slug ?? "clothing") as string,
    category_name:
      initial?.category_name ??
      (initialJoin?.name ?? undefined) ??
      null,
    product_type: (initial?.product_type ?? "ready_made") as ProductType,
    thumbnail_url: initial?.thumbnail_url ?? "",
    detail_blocks: (initial?.detail_blocks as DetailBlock[]) ?? [],
    price_fixed: initial?.price_fixed ?? "",
    price_min: initial?.price_min ?? "",
    price_max: initial?.price_max ?? "",
    lead_time_days: initial?.lead_time_days ?? "",
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const priceRendered =
    state.product_type === "ready_made"
      ? state.price_fixed
        ? formatKRW(Number(state.price_fixed))
        : "-"
      : state.price_min && state.price_max
        ? `${formatKRW(Number(state.price_min))} ~ ${formatKRW(
            Number(state.price_max),
          )}`
        : "-";

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const res = await saveProduct({
        id: state.id,
        name: state.name,
        category_slug: state.category_slug,
        product_type: state.product_type,
        thumbnail_url: state.thumbnail_url,
        detail_blocks: state.detail_blocks,
        price_fixed: state.price_fixed === "" ? null : Number(state.price_fixed),
        price_min: state.price_min === "" ? null : Number(state.price_min),
        price_max: state.price_max === "" ? null : Number(state.price_max),
        lead_time_days:
          state.lead_time_days === "" ? null : Number(state.lead_time_days),
        is_active: state.is_active,
        sort_order: state.sort_order === "" ? null : Number(state.sort_order),
      });
      toast.success(state.id ? "수정되었습니다." : "상품이 등록되었습니다.");
      if (!state.id) router.replace(`/admin/products/${res.id}`);
      else router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label required>상품명</Label>
              <Input
                value={state.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="예: 맞춤 경추 메모리폼 베개"
              />
            </div>
            <div className="space-y-1.5">
              <Label>카테고리</Label>
              <Select
                value={state.category_slug}
                onChange={(e) => {
                  const slug = e.target.value as string;
                  set("category_slug", slug);
                  const found = categories?.find((c) => c.slug === slug);
                  set("category_name", found?.name ?? null);
                }}
              >
                {(categories ?? []).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>상품 유형</Label>
              <Select
                value={state.product_type}
                onChange={(e) =>
                  set("product_type", e.target.value as ProductType)
                }
              >
                {PRODUCT_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            {state.product_type === "ready_made" ? (
              <div className="space-y-1.5 md:col-span-2">
                <Label required>확정 가격 (원)</Label>
                <Input
                  type="number"
                  value={state.price_fixed}
                  onChange={(e) =>
                    set(
                      "price_fixed",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="예: 120000"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label required>최소 참고가 (원)</Label>
                  <Input
                    type="number"
                    value={state.price_min}
                    onChange={(e) =>
                      set(
                        "price_min",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label required>최대 참고가 (원)</Label>
                  <Input
                    type="number"
                    value={state.price_max}
                    onChange={(e) =>
                      set(
                        "price_max",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label required>리드타임 (일)</Label>
                  <Input
                    type="number"
                    value={state.lead_time_days}
                    onChange={(e) =>
                      set(
                        "lead_time_days",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="예: 14"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label>정렬 순서</Label>
              <Input
                type="number"
                value={state.sort_order}
                onChange={(e) =>
                  set(
                    "sort_order",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="낮을수록 앞"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                활성 (대리점에 노출)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>썸네일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.thumbnail_url}
                alt={state.name}
                className="h-48 w-full rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground">
                썸네일이 없습니다. 1:1 비율, 1080px 이상 권장.
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted">
              <ImagePlus className="h-4 w-4" />
              {state.thumbnail_url ? "썸네일 교체" : "썸네일 업로드"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setUploading(true);
                    const { publicUrl } = await uploadProductAsset(f, "thumbs");
                    set("thumbnail_url", publicUrl);
                  } catch (err) {
                    toast.error(
                      `업로드 실패: ${(err as Error).message || "권한·용량 확인"}`,
                    );
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
            {uploading ? (
              <p className="text-xs text-muted-foreground">업로드 중…</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>상세 페이지 (블록 에디터)</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              이미지·텍스트·특징 목록·구분선 블록을 조합해 모바일 브로셔를 만듭니다.
              저장 시 전 대리점에 즉시 반영됩니다.
            </p>
          </CardHeader>
          <CardContent>
            <BlockEditor
              value={state.detail_blocks}
              onChange={(next) => set("detail_blocks", next)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <div className="flex gap-2">
            {state.id ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" /> 삭제
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/products">취소</Link>
            </Button>
            <Button loading={saving} onClick={handleSubmit}>
              <Save className="h-4 w-4" />
              {state.id ? "수정 저장" : "등록"}
            </Button>
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      <div className="xl:sticky xl:top-8 xl:self-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> 모바일 미리보기
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-h-[78vh] w-full max-w-[360px] overflow-y-auto rounded-[36px] border-[10px] border-zinc-900 bg-background shadow-elevated">
              <div className="h-5 bg-zinc-900" />
              <div className="space-y-4 p-4">
                {state.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.thumbnail_url}
                    alt={state.name}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-xl bg-muted" />
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline">
                      {state.category_name ?? categoryLabel(state.category_slug)}
                    </Badge>
                    <Badge variant="accent">
                      {PRODUCT_TYPE_LABEL[state.product_type]}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {state.name || "상품명"}
                  </h2>
                  <div className="text-base font-semibold tabular-nums">
                    {priceRendered}
                  </div>
                  {state.product_type !== "ready_made" && state.lead_time_days ? (
                    <p className="text-xs text-muted-foreground">
                      약 {state.lead_time_days}일 소요
                    </p>
                  ) : null}
                </div>
                <ProductDetailView blocks={state.detail_blocks} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="상품 삭제"
        description="삭제된 상품은 복구할 수 없습니다. 진행할까요?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteProduct(state.id!);
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            >
              삭제
            </Button>
          </>
        }
      />
    </div>
  );
}
