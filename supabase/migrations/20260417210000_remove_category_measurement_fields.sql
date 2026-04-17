-- v2.3: simplify categories (remove measurement template/advanced mode)
ALTER TABLE public.product_categories
  DROP COLUMN IF EXISTS measurement_keys;

ALTER TABLE public.product_categories
  DROP COLUMN IF EXISTS measurement_profile;

-- Drop check constraint if it still exists (name from initial creation)
ALTER TABLE public.product_categories
  DROP CONSTRAINT IF EXISTS product_categories_measurement_profile_ck;

