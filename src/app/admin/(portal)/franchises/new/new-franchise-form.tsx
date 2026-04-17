"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFranchise, type FranchiseActionState } from "../actions";

function generateCode() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `FD-${rand}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "등록 중…" : "대리점 개설"}
    </Button>
  );
}

export function NewFranchiseForm() {
  const [state, action] = useFormState<FranchiseActionState, FormData>(
    createFranchise,
    {},
  );
  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const fe = state?.fieldErrors ?? {};

  return (
    <form action={action} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="code" required>
          대리점 코드
        </Label>
        <Input
          id="code"
          name="code"
          defaultValue={generateCode()}
          placeholder="예: FD-0042"
        />
        <p className="text-xs text-muted-foreground">
          영문/숫자/하이픈/언더스코어만. 로그인 ID로 사용됩니다.
        </p>
        {fe.code ? (
          <p className="text-xs text-destructive">{fe.code}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" required>
          대리점명
        </Label>
        <Input id="name" name="name" placeholder="예: 강남점" />
        {fe.name ? (
          <p className="text-xs text-destructive">{fe.name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="owner_name" required>
          점주 이름
        </Label>
        <Input id="owner_name" name="owner_name" />
        {fe.owner_name ? (
          <p className="text-xs text-destructive">{fe.owner_name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" required>
          연락처
        </Label>
        <Input id="phone" name="phone" placeholder="010-0000-0000" />
        {fe.phone ? (
          <p className="text-xs text-destructive">{fe.phone}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          이메일 (비밀번호 재설정용)
        </Label>
        <Input id="email" name="email" type="email" />
        <p className="text-xs text-muted-foreground">
          비밀번호 재설정 링크가 이 이메일로 발송됩니다.
        </p>
        {fe.email ? (
          <p className="text-xs text-destructive">{fe.email}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address" required>
          주소
        </Label>
        <Input id="address" name="address" />
        {fe.address ? (
          <p className="text-xs text-destructive">{fe.address}</p>
        ) : null}
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="initial_password" required>
          초기 비밀번호 (8자 이상)
        </Label>
        <Input
          id="initial_password"
          name="initial_password"
          type="text"
          placeholder="대리점에 전달할 초기 비밀번호"
        />
        <p className="text-xs text-muted-foreground">
          대리점 첫 로그인 후 비밀번호를 변경하도록 안내해 주세요.
        </p>
        {fe.initial_password ? (
          <p className="text-xs text-destructive">{fe.initial_password}</p>
        ) : null}
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
