# Cellings

3D 바디스캔 맞춤 쇼핑몰 — Next.js 14(App Router) · Supabase · Vercel.

## 로컬 개발

```bash
npm install
cp .env.local.example .env.local
# Supabase URL / anon / service role 키 입력
npm run dev
```

## Supabase

1. 새 프로젝트 생성 후 **SQL Editor**에서 `supabase/migrations/20260417000000_initial_schema.sql` 전체 실행 (또는 Supabase CLI로 `db push`).
2. **Authentication → URL configuration**에 로컬·배포 도메인(Site URL, Redirect URLs) 추가.
3. **최초 중앙관리자**
   - Authentication에서 이메일 사용자 1명 생성.
   - SQL Editor (service role로 실행) 예시:

```sql
INSERT INTO public.user_profiles (user_id, role, franchise_id)
VALUES ('<auth.users의 uuid>', 'super_admin', NULL);
```

4. **대리점 계정**은 이후 `/admin/franchises` 개설 플로우(구현 예정) 또는 Dashboard에서 Auth 사용자 생성 + `franchises` + `user_profiles` 행을 **서비스 롤**로 한 번에 넣는 방식으로 생성합니다. (`user_profiles` 직접 INSERT는 RLS로 막혀 있으며 서비스 롤은 우회합니다.)
5. **이미 적용한 DB에 Storage 경고만 고치려면** `supabase/migrations/20260417120000_storage_private_auth_read.sql`을 SQL Editor에서 실행합니다.

### Storage (`product-assets`)

버킷은 **비공개**이며, 읽기는 로그인한 **중앙관리자·대리점**만 허용됩니다(Security Advisor의 *Public Bucket Allows Listing* 완화).

썸네일·블록 이미지 URL은 DB에 `.../object/public/...` 형태로 두기보다 **객체 경로**를 저장하고, 화면에서는 `createSignedUrl()`(또는 서버에서 서명 URL 생성)으로 표시하는 편이 안전합니다.

## 환경 변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트·서버 공통 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트·서버 공통 |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** — 대리점 코드→이메일 조회 등 |

## Vercel 배포

- **Framework Preset:** Next.js (자동 감지되면 그대로 두면 됩니다.)
- **Output Directory:** 비워 두거나 기본값만 사용하세요. `public`으로 지정하면 빌드 후 *Missing public directory* 오류가 납니다. Next.js 출력은 `.next`이며 Vercel이 처리합니다.
- 저장소 루트에 `vercel.json`의 `"framework": "nextjs"`가 있으면 설정이 흔들릴 때 도움이 됩니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드

## 라우트

- `/` — 진입(관리·대리점 링크)
- `/admin/*` — 중앙관리(역할 `super_admin`)
- `/franchise/*` — 대리점(역할 `franchise_admin`)
