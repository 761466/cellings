-- Security Advisor: "Public Bucket Allows Listing" 완화 (이미 초기 스키마를 적용한 프로젝트용)
-- 이미 실행한 DB: public_read 정책 제거 → 비공개 버킷 + 인증 사용자만 SELECT

UPDATE storage.buckets
SET public = false
WHERE id = 'product-assets';

DROP POLICY IF EXISTS "product_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_assets_select_authenticated" ON storage.objects;

CREATE POLICY "product_assets_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-assets'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE user_id = auth.uid()
          AND role = 'franchise_admin'
      )
    )
  );
