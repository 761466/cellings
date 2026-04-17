"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { Tabs } from "@/components/ui/tabs";
import { ScannerMeasurementEditor } from "@/components/measurements/scanner-measurement-editor";
import { ScannerMeasurementView } from "@/components/measurements/scanner-measurement-view";
import {
  type Gender,
  type MeasurementData,
} from "@/lib/domain";
import { formatDateTime, toDateInput } from "@/lib/utils";
import {
  addMeasurement,
  softDeleteCustomer,
  updateCustomer,
} from "../actions";
import type { Measurement } from "@/lib/types";

export function CustomerClient({
  customer,
  measurements,
}: {
  customer: {
    id: string;
    name: string;
    phone: string;
    gender: Gender | null;
    birth_year: number | null;
    memo: string | null;
    privacy_agreed_at: string;
    created_at: string;
  };
  measurements: Measurement[];
}) {
  const [editing, setEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [showScan, setShowScan] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [tab, setTab] = React.useState(
    measurements[0]?.id ?? "",
  );

  const [form, setForm] = React.useState({
    name: customer.name,
    phone: customer.phone,
    gender: (customer.gender ?? "") as "" | Gender,
    birth_year: (customer.birth_year ?? "") as "" | number,
    memo: customer.memo ?? "",
  });

  const [newMeasure, setNewMeasure] = React.useState<MeasurementData>({});
  const [newDate, setNewDate] = React.useState(toDateInput());
  const [newMemo, setNewMemo] = React.useState("");

  const activeMeasure = measurements.find((m) => m.id === tab) ?? measurements[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>기본 정보</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={editing ? "outline" : "outline"}
              size="sm"
              onClick={() => setEditing((v) => !v)}
            >
              <Pencil className="h-4 w-4" /> {editing ? "보기" : "수정"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> 삭제
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSaving(true);
                  await updateCustomer(customer.id, {
                    name: form.name,
                    phone: form.phone,
                    gender: (form.gender || undefined) as Gender | undefined,
                    birth_year:
                      typeof form.birth_year === "number"
                        ? form.birth_year
                        : undefined,
                    memo: form.memo || undefined,
                  });
                  toast.success("저장되었습니다.");
                  setEditing(false);
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="space-y-1.5">
                <Label>이름</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>연락처</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>성별</Label>
                <Select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as typeof form.gender,
                    })
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
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>메모</Label>
                <Textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button loading={saving} type="submit">
                  <Save className="h-4 w-4" /> 저장
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="이름" value={customer.name} />
              <Field label="연락처" value={customer.phone} />
              <Field
                label="성별"
                value={
                  customer.gender === "m"
                    ? "남"
                    : customer.gender === "f"
                      ? "여"
                      : customer.gender === "other"
                        ? "기타"
                        : "-"
                }
              />
              <Field
                label="출생연도"
                value={customer.birth_year ? `${customer.birth_year}` : "-"}
              />
              <Field
                label="등록일"
                value={formatDateTime(customer.created_at)}
              />
              <Field
                label="개인정보 동의"
                value={formatDateTime(customer.privacy_agreed_at)}
              />
              {customer.memo ? (
                <div className="md:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    메모
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {customer.memo}
                  </p>
                </div>
              ) : null}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>측정 이력 ({measurements.length})</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              탭으로 과거 측정 결과를 비교하고, 재스캔 버튼으로 새 측정값을 추가합니다.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowScan(true)}>
            <Plus className="h-4 w-4" /> 재스캔 추가
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {measurements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              저장된 측정값이 없습니다.
            </div>
          ) : (
            <>
              <Tabs
                value={tab || measurements[0].id}
                onChange={setTab}
                items={measurements.map((m, i) => ({
                  value: m.id,
                  label: `${i === 0 ? "최신" : ""} ${formatDateTime(m.scanned_at).slice(0, 10)}`,
                }))}
              />
              {activeMeasure ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    스캔 {formatDateTime(activeMeasure.scanned_at)}
                    {activeMeasure.memo ? ` · ${activeMeasure.memo}` : ""}
                  </p>
                  <ScannerMeasurementView data={activeMeasure.data} />
                </>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href="/franchise/customers">← 고객 목록</Link>
        </Button>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="고객 삭제"
        description="삭제 시 목록에서 숨겨지지만, 과거 주문·측정 이력은 보존됩니다."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await softDeleteCustomer(customer.id);
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

      <Dialog
        open={showScan}
        onClose={() => setShowScan(false)}
        title="재스캔 측정값 추가"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowScan(false)}>
              취소
            </Button>
            <Button
              loading={saving}
              onClick={async () => {
                try {
                  setSaving(true);
                  await addMeasurement(customer.id, {
                    scanned_at: new Date(newDate).toISOString(),
                    data: newMeasure,
                    memo: newMemo || undefined,
                  });
                  toast.success("새 측정값이 저장되었습니다.");
                  setShowScan(false);
                  setNewMeasure({});
                  setNewMemo("");
                } catch (e) {
                  toast.error((e as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              저장
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>스캔 일시</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>메모</Label>
              <Input
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
              />
            </div>
          </div>
          <ScannerMeasurementEditor
            value={newMeasure}
            onChange={setNewMeasure}
            defaultOpenGroups={["body"]}
          />
        </div>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
