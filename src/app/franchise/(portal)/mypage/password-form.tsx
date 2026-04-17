"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { changePassword } from "./actions";

export function PasswordForm() {
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (pw1.length < 8) return toast.error("비밀번호는 8자 이상");
        if (pw1 !== pw2) return toast.error("비밀번호가 일치하지 않습니다.");
        try {
          setSaving(true);
          await changePassword(pw1);
          toast.success("비밀번호가 변경되었습니다.");
          setPw1("");
          setPw2("");
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setSaving(false);
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label required>새 비밀번호</Label>
        <Input
          type="password"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">8자 이상.</p>
      </div>
      <div className="space-y-1.5">
        <Label required>새 비밀번호 확인</Label>
        <Input
          type="password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          <Save className="h-4 w-4" /> 비밀번호 변경
        </Button>
      </div>
    </form>
  );
}
