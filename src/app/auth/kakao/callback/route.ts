import { createServiceRoleClient } from "@/lib/supabase/service";
import { type NextRequest, NextResponse } from "next/server";

type KakaoTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type KakaoUserResponse = {
  kakao_account?: {
    name?: string;
    phone_number?: string;
    email?: string;
    profile?: { nickname?: string };
  };
  properties?: { nickname?: string };
};

function redirectTo(
  request: NextRequest,
  path: string,
): NextResponse {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(new URL(path, base));
}

/** 카카오/기존 DB 형식 차이 대비: 숫자만 추출, +82 → 0 */
function normalizePhoneDigits(raw: string | undefined | null): string | null {
  if (raw == null || !String(raw).trim()) return null;
  let s = String(raw).replace(/\s/g, "");
  if (s.startsWith("+82")) s = `0${s.slice(3)}`;
  const digits = s.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits;
}

function hyphenateKoreanMobile(digits: string): string {
  if (digits.length === 11 && digits.startsWith("010")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

function resolveDisplayName(user: KakaoUserResponse): string {
  const acc = user.kakao_account;
  const name = acc?.name?.trim();
  if (name) return name;
  const nick =
    acc?.profile?.nickname?.trim() ?? user.properties?.nickname?.trim();
  if (nick) return nick;
  const email = acc?.email?.trim();
  if (email && email.includes("@")) return email.split("@")[0] ?? "고객";
  return "고객";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return redirectTo(request, "/scan/error?reason=no_code");
  }

  const clientId = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return redirectTo(request, "/scan/error?reason=db_error");
  }

  let accessToken: string;
  try {
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        client_secret: clientSecret,
      }),
    });

    const tokenJson = (await tokenRes.json()) as KakaoTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      return redirectTo(request, "/scan/error?reason=token_failed");
    }
    accessToken = tokenJson.access_token;
  } catch {
    return redirectTo(request, "/scan/error?reason=token_failed");
  }

  let userJson: KakaoUserResponse;
  try {
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      return redirectTo(request, "/scan/error?reason=token_failed");
    }
    userJson = (await userRes.json()) as KakaoUserResponse;
  } catch {
    return redirectTo(request, "/scan/error?reason=token_failed");
  }

  const name = resolveDisplayName(userJson);
  const phoneDigits = normalizePhoneDigits(
    userJson.kakao_account?.phone_number,
  );
  if (!phoneDigits) {
    return redirectTo(request, "/scan/error?reason=token_failed");
  }
  const phoneFormatted = hyphenateKoreanMobile(phoneDigits);

  try {
    const supabase = createServiceRoleClient();

    const phoneVariants = [...new Set([phoneDigits, phoneFormatted])];
    const { data: existingRows, error: findErr } = await supabase
      .from("customers")
      .select("id")
      .is("deleted_at", null)
      .in("phone", phoneVariants)
      .order("created_at", { ascending: true })
      .limit(1);

    if (findErr) {
      return redirectTo(request, "/scan/error?reason=db_error");
    }

    const existing = existingRows?.[0];

    if (existing?.id) {
      return redirectTo(
        request,
        `/scan/complete?customer_id=${encodeURIComponent(existing.id)}`,
      );
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("customers")
      .insert({
        franchise_id: null,
        name,
        phone: phoneFormatted,
        privacy_agreed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr || !inserted?.id) {
      return redirectTo(request, "/scan/error?reason=db_error");
    }

    return redirectTo(
      request,
      `/scan/complete?customer_id=${encodeURIComponent(inserted.id)}`,
    );
  } catch {
    return redirectTo(request, "/scan/error?reason=db_error");
  }
}
