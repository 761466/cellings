import type {
  Gender,
  MeasurementData,
  OrderChoice,
  OrderStatus,
  ProductCategory,
  ProductType,
} from "./domain";

export type Franchise = {
  id: string;
  code: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  auth_user_id: string | null;
  created_at: string;
};

export type DetailBlock =
  | {
      id: string;
      type: "image";
      url: string;
      layout?: "full" | "half";
      alt?: string;
    }
  | {
      id: string;
      type: "text";
      variant: "title" | "body";
      content: string;
    }
  | {
      id: string;
      type: "features";
      items: { icon?: string; text: string }[];
    }
  | {
      id: string;
      type: "divider";
    };

export type Product = {
  id: string;
  category_slug: ProductCategory;
  category_name?: string | null;
  product_type: ProductType;
  name: string;
  thumbnail_url: string;
  detail_blocks: DetailBlock[];
  price_fixed: number | null;
  price_min: number | null;
  price_max: number | null;
  lead_time_days: number | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
};

export type Customer = {
  id: string;
  franchise_id: string;
  name: string;
  phone: string;
  gender: Gender | null;
  birth_year: number | null;
  memo: string | null;
  privacy_agreed_at: string;
  deleted_at: string | null;
  created_at: string;
};

export type Measurement = {
  id: string;
  customer_id: string;
  scanned_at: string;
  data: MeasurementData;
  memo: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  franchise_id: string;
  product_id: string;
  customer_id: string;
  measurement_id: string;
  quantity: number;
  price: number;
  product_type: ProductType;
  product_type_selected: OrderChoice;
  status: OrderStatus;
  memo: string | null;
  ordered_at: string;
};
