import { createServiceRoleClient } from "@/lib/supabase/service";
import { type NextRequest, NextResponse } from "next/server";

type KakaoTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type KakaoUserResponse = {
  kakao_account?: {
    profile?: { nickname?: string };
    email?: string;
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

function normalizeEmail(raw: string | undefined | null): string | null {
  if (raw == null || !String(raw).trim()) return null;
  return String(raw).trim().toLowerCase();
}

/** 닉네임 우선(동의 항목: 닉네임), 없으면 이메일 앞부분 */
function resolveKakaoDisplayName(user: KakaoUserResponse): string {
  const acc = user.kakao_account;
  const nick =
    acc?.profile?.nickname?.trim() ?? user.properties?.nickname?.trim();
  if (nick) return nick;
  const email = normalizeEmail(acc?.email);
  if (email && email.includes("@")) {
    return email.split("@")[0] ?? "고객";
  }
  return "고객";
}

export async function GET(request: NextRequest) {
  const oauthError = request.nextUrl.searchParams.get("error");
  const oauthDesc = request.nextUrl.searchParams.get("error_description");
  if (oauthError) {
    console.error("[kakao/callback] OAuth error:", oauthError, oauthDesc ?? "");
    return redirectTo(request, "/scan/error?reason=kakao_denied");
  }

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
      console.error(
        "[kakao/callback] token exchange failed:",
        tokenJson.error,
        tokenJson.error_description,
        "http_status",
        tokenRes.status,
      );
      return redirectTo(request, "/scan/error?reason=kakao_oauth");
    }
    accessToken = tokenJson.access_token;
  } catch (e) {
    console.error("[kakao/callback] token fetch exception:", e);
    return redirectTo(request, "/scan/error?reason=kakao_oauth");
  }

  let userJson: KakaoUserResponse;
  try {
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        property_keys: JSON.stringify([
          "kakao_account.profile",
          "kakao_account.email",
        ]),
      }),
    });
    if (!userRes.ok) {
      console.error("[kakao/callback] user/me failed:", userRes.status);
      return redirectTo(request, "/scan/error?reason=kakao_user");
    }
    userJson = (await userRes.json()) as KakaoUserResponse;
  } catch (e) {
    console.error("[kakao/callback] user/me exception:", e);
    return redirectTo(request, "/scan/error?reason=kakao_user");
  }

  const name = resolveKakaoDisplayName(userJson);
  const email = normalizeEmail(userJson.kakao_account?.email);
  if (!email) {
    console.error(
      "[kakao/callback] email missing; enable account_email consent and add scope to authorize URL",
    );
    return redirectTo(request, "/scan/error?reason=kakao_email");
  }

  try {
    const supabase = createServiceRoleClient();

    const { data: existingRows, error: findErr } = await supabase
      .from("customers")
      .select("id")
      .is("deleted_at", null)
      .eq("email", email)
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
        email,
        phone: null,
        privacy_agreed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr || !inserted?.id) {
      console.error("[kakao/callback] insert failed:", insertErr);
      return redirectTo(request, "/scan/error?reason=db_error");
    }

    return redirectTo(
      request,
      `/scan/complete?customer_id=${encodeURIComponent(inserted.id)}`,
    );
  } catch (e) {
    console.error("[kakao/callback] db exception:", e);
    return redirectTo(request, "/scan/error?reason=db_error");
  }
}
