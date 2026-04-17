"use client";

import { useState, useTransition, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  sendPasswordResetLink,
  toggleFranchiseActive,
  updateFranchise,
  type FranchiseActionState,
} from "../actions";

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      저장
    </Button>
  );
}

export function FranchiseDetailClient({
  initial,
}: {
  initial: {
    id: string;
    name: string;
    owner_name: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
    code: string;
  };
}) {
  const [state, action] = useFormState<FranchiseActionState, FormData>(
    updateFranchise,
    {},
  );
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.ok) toast.success("저장되었습니다.");
  }, [state]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>기본 정보</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            코드 <span className="font-mono">{initial.code}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={pending}
            onClick={() =>
              start(async () => {
                try {
                  await sendPasswordResetLink(initial.email);
                  toast.success("재설정 링크를 이메일로 발송했습니다.");
                } catch {
                  toast.error("발송 실패");
                }
              })
            }
          >
            비밀번호 재설정 링크 발송
          </Button>
          <Button
            type="button"
            variant={initial.is_active ? "destructive" : "default"}
            size="sm"
            onClick={() => setOpen(true)}
          >
            {initial.is_active ? "비활성화" : "활성화"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <input type="hidden" name="id" value={initial.id} />
          <div className="space-y-1.5">
            <Label htmlFor="name" required>대리점명</Label>
            <Input id="name" name="name" defaultValue={initial.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="owner_name" required>점주</Label>
            <Input
              id="owner_name"
              name="owner_name"
              defaultValue={initial.owner_name}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" required>연락처</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={initial.phone}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" required>이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initial.email}
              required
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address" required>주소</Label>
            <Input
              id="address"
              name="address"
              defaultValue={initial.address}
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Save />
          </div>
        </form>
      </CardContent>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={initial.is_active ? "대리점 비활성화" : "대리점 활성화"}
        description={
          initial.is_active
            ? "비활성화된 대리점은 로그인·주문 등록이 차단됩니다."
            : "다시 활성화하면 대리점이 로그인·주문 등록을 할 수 있습니다."
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              variant={initial.is_active ? "destructive" : "default"}
              onClick={() => {
                start(async () => {
                  await toggleFranchiseActive(initial.id, !initial.is_active);
                  setOpen(false);
                  toast.success(initial.is_active ? "비활성화했습니다." : "활성화했습니다.");
                });
              }}
              loading={pending}
            >
              확인
            </Button>
          </>
        }
      />
    </Card>
  );
}
