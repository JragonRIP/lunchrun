-- Orders must go through the app (service role). Block direct anon inserts.
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Anyone can create order items" on public.order_items;
