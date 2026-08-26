-- Lunch Run schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- Stores
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  active boolean not null default true,
  is_default boolean not null default false,
  price_source text,
  external_location_id text,
  hours text,
  created_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int not null default 0,
  shopping_order int not null default 0,
  active boolean not null default true
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  description text,
  size text,
  flavor text,
  category_id uuid references public.categories(id),
  image_url text,
  store_id uuid references public.stores(id),
  current_price numeric(10,2),
  min_price numeric(10,2),
  max_price numeric(10,2),
  popularity int not null default 50,
  available boolean not null default true,
  active boolean not null default true,
  archived boolean not null default false,
  last_price_update timestamptz,
  external_product_url text,
  external_product_id text,
  max_quantity int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_external_id_idx on public.products(external_product_id);
create index if not exists products_category_idx on public.products(category_id);

-- Product store prices
create table if not exists public.product_store_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  price numeric(10,2) not null,
  available boolean not null default true,
  last_checked timestamptz,
  unique(product_id, store_id)
);

-- Price history
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  old_price numeric(10,2),
  new_price numeric(10,2) not null,
  store_id uuid references public.stores(id),
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

-- Settings (single-row style)
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  service_fee numeric(10,2) not null default 1.50,
  min_merchandise numeric(10,2) not null default 3.00,
  max_merchandise numeric(10,2) not null default 20.00,
  max_items_per_order int not null default 8,
  max_daily_orders int not null default 20,
  default_cutoff text not null default '11:30',
  default_delivery_window text not null default 'Lunch period',
  tax_mode text not null default 'simple' check (tax_mode in ('simple','receipt')),
  tax_rate numeric(8,4) not null default 0.0825,
  active_store_id uuid references public.stores(id),
  delivery_locations jsonb not null default '["Cafeteria","Commons","Hallway","Outside cafeteria","Other"]'::jsonb,
  payment_methods jsonb not null default '["Cash Prepay"]'::jsonb,
  allow_custom_requests boolean not null default true,
  allow_substitutions boolean not null default true,
  promo_fee numeric(10,2),
  promo_label text,
  promo_active boolean not null default false,
  test_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Sessions
create table if not exists public.lunch_run_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  store_id uuid references public.stores(id),
  open_time text not null default '07:00',
  cutoff_time text not null default '11:30',
  delivery_window text,
  status text not null default 'open',
  max_orders int not null default 20,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  tracking_token text not null unique,
  session_id uuid not null references public.lunch_run_sessions(id),
  customer_name text not null,
  delivery_location text not null,
  delivery_location_other text,
  payment_method text not null,
  notes text,
  tip_amount numeric(10,2) not null default 0,
  status text not null default 'received',
  payment_status text not null default 'unpaid',
  merchandise_estimate_min numeric(10,2) not null default 0,
  merchandise_estimate_max numeric(10,2) not null default 0,
  merchandise_actual numeric(10,2),
  tax_amount numeric(10,2) not null default 0,
  service_fee numeric(10,2) not null default 1.50,
  estimated_total_min numeric(10,2) not null default 0,
  estimated_total_max numeric(10,2) not null default 0,
  final_total numeric(10,2),
  max_authorized_total numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  change_owed numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists orders_session_idx on public.orders(session_id);
create index if not exists orders_token_idx on public.orders(tracking_token);

-- Order items (snapshot)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  is_custom boolean not null default false,
  product_name text not null,
  brand text,
  size text,
  flavor text,
  description text,
  quantity int not null default 1,
  estimated_price numeric(10,2),
  min_estimated numeric(10,2),
  max_estimated numeric(10,2),
  max_price numeric(10,2) not null,
  actual_price numeric(10,2),
  tax_amount numeric(10,2) not null default 0,
  substitution text not null default 'closest_under_max',
  substitution_notes text,
  status text not null default 'pending',
  replacement_name text,
  replacement_price numeric(10,2),
  picked_up boolean not null default false,
  image_url text
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(10,2) not null,
  method text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Deliveries
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null default 'pending',
  note text,
  delivered_at timestamptz
);

-- Price import logs
create table if not exists public.price_import_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  timestamp timestamptz not null default now(),
  total_products int not null default 0,
  successful_updates int not null default 0,
  failed_updates int not null default 0,
  new_products int not null default 0,
  warnings jsonb not null default '[]'::jsonb
);

-- Pending product matches
create table if not exists public.pending_product_matches (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  name text not null,
  brand text,
  size text,
  price numeric(10,2),
  product_url text,
  image_url text,
  store text,
  match_status text not null default 'pending_review',
  matched_product_id uuid references public.products(id),
  created_at timestamptz not null default now()
);

-- Admins profile (links to auth.users)
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_store_prices enable row level security;
alter table public.price_history enable row level security;
alter table public.settings enable row level security;
alter table public.lunch_run_sessions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.price_import_logs enable row level security;
alter table public.pending_product_matches enable row level security;
alter table public.admins enable row level security;

-- Public read policies
create policy "Public read active stores" on public.stores for select using (active = true);
create policy "Public read active categories" on public.categories for select using (active = true);
create policy "Public read active products" on public.products for select using (active = true and archived = false);
create policy "Public read settings" on public.settings for select using (true);
create policy "Public read sessions" on public.lunch_run_sessions for select using (true);

-- Orders: insert allowed for anon (validated in app); select by token via RPC preferred
create policy "Anyone can create orders" on public.orders for insert with check (true);
create policy "Anyone can create order items" on public.order_items for insert with check (true);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

create policy "Admins all stores" on public.stores for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all product prices" on public.product_store_prices for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all price history" on public.price_history for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all sessions" on public.lunch_run_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all deliveries" on public.deliveries for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all import logs" on public.price_import_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins all pending matches" on public.pending_product_matches for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read admins" on public.admins for select using (public.is_admin());

-- Secure order lookup by tracking token
create or replace function public.get_order_by_token(p_token text)
returns setof public.orders
language sql
security definer
set search_path = public
as $$
  select * from public.orders where tracking_token = p_token limit 1;
$$;

grant execute on function public.get_order_by_token(text) to anon, authenticated;
