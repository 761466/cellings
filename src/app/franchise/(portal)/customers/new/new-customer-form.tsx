"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { type MeasurementData } from "@/lib/domain";
import { toDateInput } from "@/lib/utils";
import { ScannerMeasurementEditor } from "@/components/measurements/scanner-measurement-editor";
import { createCustomerWithMeasurement } from "../actions";

export function NewCustomerForm() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [measure, setMeasure] = React.useState<MeasurementData>({});
  const [scannedAt, setScannedAt] = React.useState(toDateInput());
  const [includeMeasurement, setIncludeMeasurement] = React.useState(true);

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    gender: "" as "" | "m" | "f" | "other",
    birth_year: "" as "" | number,
    memo: "",
    measurement_memo: "",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>고객 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label required>이름</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label required>연락처</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>성별</Label>
            <Select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as typeof form.gender })
              }
            >
              <option value="">선택 안 함</option>
              <option value="f">여</option>
              <option value="m">남</option>
              <option value="other">기타</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>출생연도</Label>
            <Input
              type="number"
              value={form.birth_year}
              onChange={(e) =>
                setForm({
                  ...form,
                  birth_year:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="예: 1985"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>메모</Label>
            <Textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              placeholder="특이사항·요청사항 등"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>첫 3D 스캔 측정</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              체형·체성분·자세·척추·발 스캔 등 전체 스캐너 출력을 섹션별로
              저장합니다.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeMeasurement}
              onChange={(e) => setIncludeMeasurement(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            이번에 측정값 입력
          </label>
        </CardHeader>
        {includeMeasurement ? (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>스캔 일시</Label>
                <Input
                  type="date"
                  value={scannedAt}
                  onChange={(e) => setScannedAt(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>측정 메모</Label>
                <Input
                  value={form.measurement_memo}
                  onChange={(e) =>
                    setForm({ ...form, measurement_memo: e.target.value })
                  }
                  placeholder="스캐너 기종, 특이 자세 등"
                />
              </div>
            </div>
            <ScannerMeasurementEditor
              value={measure}
              onChange={setMeasure}
              defaultOpenGroups={["body"]}
            />
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span>
              <strong>(필수)</strong> 개인정보 수집·이용에 동의합니다.
              <span className="block text-xs text-muted-foreground">
                수집항목: 이름, 연락처, 성별, 출생연도, 신체 측정값 · 이용목적:
                맞춤 제품 제작·상담 · 보관기간: 측정 후 3년(법정 보관기간 종료
                후 지체 없이 파기).
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2 pb-4">
        <Button asChild variant="outline">
          <Link href="/franchise/customers">
            <ArrowLeft className="h-4 w-4" /> 취소
          </Link>
        </Button>
        <Button
          loading={saving}
          onClick={async () => {
            if (!form.name.trim() || !form.phone.trim()) {
              toast.error("이름·연락처는 필수입니다.");
              return;
            }
            if (!agree) {
              toast.error("개인정보 수집·이용 동의가 필요합니다.");
              return;
            }
            try {
              setSaving(true);
              await createCustomerWithMeasurement({
                customer: {
                  name: form.name.trim(),
                  phone: form.phone.trim(),
                  gender: form.gender || undefined,
                  birth_year:
                    typeof form.birth_year === "number"
                      ? form.birth_year
                      : undefined,
                  memo: form.memo || undefined,
                  privacy_agreed: true,
                },
                measurement: includeMeasurement
                  ? {
                      scanned_at: new Date(scannedAt).toISOString(),
                      data: measure,
                      memo: form.measurement_memo || undefined,
                    }
                  : null,
              });
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setSaving(false);
              router.refresh();
            }
          }}
        >
          <Save className="h-4 w-4" /> 등록
        </Button>
      </div>
    </div>
  );
}
