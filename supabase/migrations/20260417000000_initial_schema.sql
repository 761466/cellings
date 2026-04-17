-- Cellings: franchises, catalog, customers, orders
-- Run via Supabase CLI or SQL editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE public.user_role AS ENUM ('super_admin', 'franchise_admin');

CREATE TYPE public.product_category AS ENUM (
  'pillow',
  'shoes',
  'clothing',
  'shapewear'
);

CREATE TYPE public.product_type AS ENUM (
  'ready_made',
  'custom',
  'both'
);

CREATE TYPE public.order_product_choice AS ENUM (
  'ready_made',
  'custom'
);

CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed',
  'producing',
  'done'
);

CREATE TYPE public.gender AS ENUM (
  'm',
  'f',
  'other'
);

-- Franchises
CREATE TABLE public.franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL UNIQUE,
  address text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  auth_user_id uuid UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_franchises_email ON public.franchises (lower(email));

-- Profiles (1:1 with auth.users)
CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  franchise_id uuid REFERENCES public.franchises (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_franchise_role_ck CHECK (
    (role = 'super_admin' AND franchise_id IS NULL)
    OR (role = 'franchise_admin' AND franchise_id IS NOT NULL)
  )
);

CREATE INDEX idx_user_profiles_franchise ON public.user_profiles (franchise_id);

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.product_category NOT NULL,
  product_type public.product_type NOT NULL,
  name text NOT NULL,
  thumbnail_url text NOT NULL,
  detail_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_fixed integer,
  price_min integer,
  price_max integer,
  lead_time_days integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON public.products (category);
CREATE INDEX idx_products_active_sort ON public.products (is_active, sort_order);

-- Customers (soft delete)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid NOT NULL REFERENCES public.franchises (id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  gender public.gender,
  birth_year integer,
  memo text,
  privacy_agreed_at timestamptz NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_franchise ON public.customers (franchise_id);
CREATE INDEX idx_customers_deleted ON public.customers (franchise_id) WHERE deleted_at IS NULL;

-- Measurements
CREATE TABLE public.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  scanned_at timestamptz NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  memo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_measurements_customer ON public.measurements (customer_id);
CREATE INDEX idx_measurements_scanned ON public.measurements (scanned_at);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid NOT NULL REFERENCES public.franchises (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id),
  customer_id uuid NOT NULL REFERENCES public.customers (id),
  measurement_id uuid NOT NULL REFERENCES public.measurements (id),
  quantity integer NOT NULL DEFAULT 1,
  price integer NOT NULL,
  product_type public.product_type NOT NULL,
  product_type_selected public.order_product_choice NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  memo text,
  ordered_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_product_type_selected_ck CHECK (
    (product_type = 'ready_made' AND product_type_selected = 'ready_made'::public.order_product_choice)
    OR (product_type = 'custom' AND product_type_selected = 'custom'::public.order_product_choice)
    OR (
      product_type = 'both'
      AND product_type_selected IN (
        'ready_made'::public.order_product_choice,
        'custom'::public.order_product_choice
      )
    )
  )
);

CREATE INDEX idx_orders_franchise ON public.orders (franchise_id);
CREATE INDEX idx_orders_ordered_at ON public.orders (ordered_at);
CREATE INDEX idx_orders_status ON public.orders (status);

-- RLS helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_franchise_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT franchise_id
  FROM public.user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- user_profiles: own row + super_admin all
CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_super_admin());

-- 직접 가입으로 프로필 생성 금지 (역할 사칭 방지). 프로필은 서비스 롤/API·SQL로만 생성.
CREATE POLICY "user_profiles_insert_blocked"
  ON public.user_profiles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "user_profiles_update_super"
  ON public.user_profiles FOR UPDATE
  USING (public.is_super_admin());

-- franchises
CREATE POLICY "franchises_select"
  ON public.franchises FOR SELECT
  USING (
    public.is_super_admin()
    OR id = public.current_franchise_id()
  );

CREATE POLICY "franchises_write_super"
  ON public.franchises FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- products
CREATE POLICY "products_select"
  ON public.products FOR SELECT
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

CREATE POLICY "products_write_super"
  ON public.products FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- customers
CREATE POLICY "customers_select"
  ON public.customers FOR SELECT
  USING (
    public.is_super_admin()
    OR franchise_id = public.current_franchise_id()
  );

CREATE POLICY "customers_insert"
  ON public.customers FOR INSERT
  WITH CHECK (
    franchise_id = public.current_franchise_id()
    AND NOT public.is_super_admin()
  );

CREATE POLICY "customers_update"
  ON public.customers FOR UPDATE
  USING (
    public.is_super_admin()
    OR franchise_id = public.current_franchise_id()
  )
  WITH CHECK (
    public.is_super_admin()
    OR franchise_id = public.current_franchise_id()
  );

-- measurements (via customer franchise)
CREATE POLICY "measurements_select"
  ON public.measurements FOR SELECT
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.customers c
      WHERE c.id = measurements.customer_id
        AND c.franchise_id = public.current_franchise_id()
    )
  );

CREATE POLICY "measurements_insert"
  ON public.measurements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.customers c
      WHERE c.id = measurements.customer_id
        AND c.franchise_id = public.current_franchise_id()
    )
  );

CREATE POLICY "measurements_update"
  ON public.measurements FOR UPDATE
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.customers c
      WHERE c.id = measurements.customer_id
        AND c.franchise_id = public.current_franchise_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.customers c
      WHERE c.id = measurements.customer_id
        AND c.franchise_id = public.current_franchise_id()
    )
  );

-- orders
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (
    public.is_super_admin()
    OR franchise_id = public.current_franchise_id()
  );

CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (
    franchise_id = public.current_franchise_id()
    AND NOT public.is_super_admin()
  );

CREATE POLICY "orders_update"
  ON public.orders FOR UPDATE
  USING (
    public.is_super_admin()
    OR franchise_id = public.current_franchise_id()
  )
  WITH CHECK (
    public.is_super_admin()
    OR franchise_id = public.current_franchise_id()
  );

-- Storage: product assets (thumbnails & block images)
-- public=false + authenticated 전용 SELECT — 익명 목록(listing) 경고 방지
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-assets', 'product-assets', false)
ON CONFLICT (id) DO NOTHING;

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

CREATE POLICY "product_assets_super_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-assets'
    AND public.is_super_admin()
  );

CREATE POLICY "product_assets_super_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-assets' AND public.is_super_admin());

CREATE POLICY "product_assets_super_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-assets' AND public.is_super_admin());
