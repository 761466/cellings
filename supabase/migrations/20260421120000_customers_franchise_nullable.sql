-- 카카오 OAuth 등 대리점 미배정 고객: franchise_id 없이 등록 가능
ALTER TABLE public.customers
  ALTER COLUMN franchise_id DROP NOT NULL;
