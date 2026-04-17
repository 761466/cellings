-- v2.1: product categories as a table (extensible)
-- - replaces enum-based products.category with FK-based products.category_slug
-- - seeds default 4 categories

-- Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  measurement_profile text NOT NULL DEFAULT 'clothing',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_categories_measurement_profile_ck CHECK (
    measurement_profile IN ('pillow','shoes','clothing','shapewear')
  )
);

CREATE INDEX IF NOT EXISTS idx_product_categories_active_sort
  ON public.product_categories (is_active, sort_order);

-- Seed defaults (idempotent)
INSERT INTO public.product_categories (slug, name, measurement_profile, is_active, sort_order)
VALUES
  ('pillow',    '베개',     'pillow',    true, 10),
  ('shoes',     '신발',     'shoes',     true, 20),
  ('clothing',  '의류',     'clothing',  true, 30),
  ('shapewear', '보정속옷', 'shapewear', true, 40)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  measurement_profile = EXCLUDED.measurement_profile,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Products: add FK column then migrate
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_slug text;

-- Migrate existing enum values (if the old column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='category'
  ) THEN
    UPDATE public.products
    SET category_slug = category::text
    WHERE category_slug IS NULL;
  END IF;
END $$;

-- Ensure non-null and FK
ALTER TABLE public.products
  ALTER COLUMN category_slug SET NOT NULL;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_slug_fk
  FOREIGN KEY (category_slug) REFERENCES public.product_categories (slug);

CREATE INDEX IF NOT EXISTS idx_products_category_slug ON public.products (category_slug);

-- Drop old index/column/type (safe-guarded)
DROP INDEX IF EXISTS public.idx_products_category;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='category'
  ) THEN
    ALTER TABLE public.products DROP COLUMN category;
  END IF;
END $$;

-- Drop enum type if nothing references it anymore
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
    -- only drop when no columns use it
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE udt_schema='public' AND udt_name='product_category'
    ) THEN
      DROP TYPE public.product_category;
    END IF;
  END IF;
END $$;

-- RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Read: super_admin all, franchise_admin only active
CREATE POLICY "product_categories_select"
  ON public.product_categories FOR SELECT
  USING (
    public.is_super_admin()
    OR (
      is_active = true
      AND EXISTS (
        SELECT 1
        FROM public.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.role = 'franchise_admin'
      )
    )
  );

-- Write: super admin only
CREATE POLICY "product_categories_write_super"
  ON public.product_categories FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

