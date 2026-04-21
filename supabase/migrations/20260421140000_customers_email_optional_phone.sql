-- 카카오 로그인: 이메일·닉네임만 사용 시 전화 없이 등록
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.customers
  ALTER COLUMN phone DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_email_active
  ON public.customers (email)
  WHERE deleted_at IS NULL AND email IS NOT NULL;
