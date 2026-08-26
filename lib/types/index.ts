export type SubstitutionPreference =
  | "closest_under_max"
  | "any_flavor"
  | "skip"
  | "ask_me";

export type OrderStatus =
  | "received"
  | "shopping_soon"
  | "shopping"
  | "purchased"
  | "returning"
  | "ready"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "partially_paid"
  | "refund_due"
  | "refunded";

export type SessionStatus =
  | "scheduled"
  | "open"
  | "ordering_closed"
  | "shopping"
  | "returning"
  | "delivering"
  | "completed"
  | "cancelled";

export type TaxMode = "simple" | "receipt";

export type PriceFreshness = "fresh" | "aging" | "stale";

export type MatchStatus = "verified" | "pending_review" | "rejected";

export interface Store {
  id: string;
  name: string;
  address: string | null;
  active: boolean;
  is_default: boolean;
  price_source: string | null;
  external_location_id: string | null;
  hours: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  shopping_order: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  size: string | null;
  flavor: string | null;
  category_id: string;
  image_url: string | null;
  store_id: string | null;
  current_price: number | null;
  min_price: number | null;
  max_price: number | null;
  popularity: number;
  available: boolean;
  active: boolean;
  archived: boolean;
  last_price_update: string | null;
  external_product_url: string | null;
  external_product_id: string | null;
  max_quantity: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category?: Category;
  store?: Store | null;
}

export interface PriceHistoryEntry {
  id: string;
  product_id: string;
  old_price: number | null;
  new_price: number;
  store_id: string | null;
  source: string;
  created_at: string;
}

export interface LunchRunSession {
  id: string;
  date: string;
  store_id: string;
  open_time: string;
  cutoff_time: string;
  delivery_window: string | null;
  status: SessionStatus;
  max_orders: number;
  created_at: string;
  store?: Store;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  is_custom: boolean;
  product_name: string;
  brand: string | null;
  size: string | null;
  flavor: string | null;
  description: string | null;
  quantity: number;
  estimated_price: number | null;
  min_estimated: number | null;
  max_estimated: number | null;
  max_price: number;
  actual_price: number | null;
  tax_amount: number;
  substitution: SubstitutionPreference;
  substitution_notes: string | null;
  status: "pending" | "found" | "substituted" | "skipped" | "unavailable";
  replacement_name: string | null;
  replacement_price: number | null;
  picked_up: boolean;
  image_url: string | null;
}

export interface Order {
  id: string;
  order_code: string;
  tracking_token: string;
  session_id: string;
  customer_name: string;
  delivery_location: string;
  delivery_location_other: string | null;
  payment_method: string;
  notes: string | null;
  tip_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  merchandise_estimate_min: number;
  merchandise_estimate_max: number;
  merchandise_actual: number | null;
  tax_amount: number;
  service_fee: number;
  estimated_total_min: number;
  estimated_total_max: number;
  final_total: number | null;
  max_authorized_total: number;
  amount_paid: number;
  change_owed: number;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  items?: OrderItem[];
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  note: string | null;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  status: "pending" | "delivered" | "not_found";
  note: string | null;
  delivered_at: string | null;
}

export interface AppSettings {
  service_fee: number;
  min_merchandise: number;
  max_merchandise: number;
  max_items_per_order: number;
  max_daily_orders: number;
  default_cutoff: string;
  default_delivery_window: string;
  tax_mode: TaxMode;
  tax_rate: number;
  active_store_id: string | null;
  delivery_locations: string[];
  payment_methods: string[];
  allow_custom_requests: boolean;
  allow_substitutions: boolean;
  promo_fee: number | null;
  promo_label: string | null;
  promo_active: boolean;
  /** When true, ordering stays open past cutoff/capacity for testing. */
  test_mode: boolean;
}

export interface PriceImportLog {
  id: string;
  source: string;
  timestamp: string;
  total_products: number;
  successful_updates: number;
  failed_updates: number;
  new_products: number;
  warnings: string[];
}

export interface PendingProductMatch {
  id: string;
  external_id: string | null;
  name: string;
  brand: string | null;
  size: string | null;
  price: number | null;
  product_url: string | null;
  image_url: string | null;
  store: string | null;
  match_status: MatchStatus;
  matched_product_id: string | null;
  created_at: string;
}

export interface CartItem {
  key: string;
  productId: string | null;
  isCustom: boolean;
  name: string;
  brand: string | null;
  size: string | null;
  flavor: string | null;
  description: string | null;
  imageUrl: string | null;
  quantity: number;
  estimatedPrice: number | null;
  minEstimated: number | null;
  maxEstimated: number | null;
  maxPrice: number;
  substitution: SubstitutionPreference;
}

export interface PriceImportItem {
  externalId?: string;
  name: string;
  brand?: string;
  size?: string;
  price: number;
  productUrl?: string;
  imageUrl?: string;
  availability?: boolean;
  store?: string;
  locationId?: string;
  lastChecked?: string;
}

export interface ShoppingListItem {
  productKey: string;
  productId: string | null;
  name: string;
  brand: string | null;
  size: string | null;
  flavor: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string;
  shoppingOrder: number;
  totalQty: number;
  knownPrice: number | null;
  customers: Array<{
    orderId: string;
    orderItemId: string;
    customerName: string;
    quantity: number;
    maxPrice: number;
    substitution: SubstitutionPreference;
  }>;
  pickedUp: boolean;
  actualPrice: number | null;
  unavailable: boolean;
}
