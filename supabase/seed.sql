-- Lunch Run seed (idempotent with fixed UUIDs)
-- Prefer demo mode for local UI; use this when connecting real Supabase.
-- No sample orders — clean production start.

-- Settings
insert into public.settings (
  id,
  service_fee,
  min_merchandise,
  max_merchandise,
  max_items_per_order,
  max_daily_orders,
  default_cutoff,
  default_delivery_window,
  tax_mode,
  tax_rate,
  delivery_locations,
  payment_methods,
  allow_custom_requests,
  allow_substitutions,
  promo_active
) values (
  1,
  1.50,
  3.00,
  20.00,
  8,
  20,
  '11:30',
  'Lunch period',
  'simple',
  0.0825,
  '["Cafeteria","Commons","Hallway","Outside cafeteria","Other"]'::jsonb,
  '["Cash Prepay"]'::jsonb,
  true,
  true,
  false
)
on conflict (id) do update set
  payment_methods = excluded.payment_methods,
  delivery_locations = excluded.delivery_locations;

-- Stores
insert into public.stores (id, name, address, active, is_default, price_source, external_location_id, hours)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Dollar General',
    'Near campus',
    true,
    true,
    'Dollar General Online',
    'DG-LOCAL',
    '8:00 AM – 10:00 PM'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Stop-N-Go',
    'Main Street',
    true,
    false,
    'Manual',
    null,
    '6:00 AM – 11:00 PM'
  )
on conflict (id) do nothing;

update public.settings
set active_store_id = '11111111-1111-1111-1111-111111111111'
where id = 1 and active_store_id is null;

-- Categories (match demo slugs)
insert into public.categories (id, name, slug, icon, sort_order, shopping_order, active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Drinks', 'drinks', 'CupSoda', 1, 1, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Energy Drinks', 'energy-drinks', 'Zap', 2, 2, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Chips', 'chips', 'Cookie', 3, 3, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Candy', 'candy', 'Candy', 4, 4, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Jerky', 'jerky', 'Beef', 5, 5, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'Snacks', 'snacks', 'Popcorn', 6, 6, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'Gum', 'gum', 'CircleDot', 7, 7, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'Other', 'other', 'Package', 8, 8, true)
on conflict (id) do nothing;

-- Products (15 demo catalog items, Dollar General store)
insert into public.products (
  id, name, brand, description, size, flavor, category_id, store_id,
  current_price, min_price, max_price, popularity, available, active, archived,
  last_price_update, external_product_id, max_quantity
) values
  (
    'cccc0001-0000-4000-8000-000000000001',
    'Monster Energy Ultra White', 'Monster', 'Zero sugar energy drink', '16 oz', 'Ultra White',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.50, 3.50, 98, true, true, false, now(), 'dg-monster-ultra-white', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000002',
    'Monster Energy Original', 'Monster', 'Classic green Monster', '16 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.50, 3.50, 90, true, true, false, now(), 'dg-monster-original', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000003',
    'Red Bull', 'Red Bull', 'Energy drink', '8.4 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.75, 2.25, 3.25, 85, true, true, false, now(), 'dg-redbull', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000004',
    'Dr Pepper', 'Dr Pepper', 'Soda', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.50, 2.25, 80, true, true, false, now(), 'dg-drpepper-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000005',
    'Coca-Cola', 'Coca-Cola', 'Classic cola', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.50, 2.25, 78, true, true, false, now(), 'dg-coke-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000006',
    'Gatorade', 'Gatorade', 'Sports drink', '20 oz', 'Fruit Punch',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.50, 2.50, 70, true, true, false, now(), 'dg-gatorade', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000007',
    'Takis Fuego', 'Takis', 'Hot chili pepper tortilla chips', '9.9 oz', 'Fuego',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.25, 2.50, 4.00, 95, true, true, false, now(), 'dg-takis-fuego', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000008',
    'Doritos Nacho Cheese', 'Doritos', 'Tortilla chips', '9.25 oz', 'Nacho Cheese',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.50, 3.75, 75, true, true, false, now(), 'dg-doritos-nacho', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000009',
    'Cheetos Flamin'' Hot', 'Cheetos', 'Flamin'' Hot cheese snacks', '8.5 oz', 'Flamin'' Hot',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.50, 3.75, 88, true, true, false, now(), 'dg-cheetos-fh', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000000a',
    'Reese''s Peanut Butter Cups', 'Reese''s', 'Chocolate peanut butter cups', '1.5 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.45, 1.00, 2.00, 82, true, true, false, now(), 'dg-reeses', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000000b',
    'Sour Patch Kids', 'Sour Patch', 'Sour then sweet candy', '8 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.95, 2.25, 3.50, 72, true, true, false, now(), 'dg-sourpatch', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000000c',
    'Skittles', 'Skittles', 'Fruit candy', '7 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.85, 2.25, 3.50, 68, true, true, false, now(), 'dg-skittles', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000000d',
    'Jack Link''s Original Beef Jerky', 'Jack Link''s', 'Beef jerky', '3.25 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111',
    5.49, 4.50, 6.50, 77, true, true, false, now(), 'dg-jack-original', 2
  ),
  (
    'cccc0001-0000-4000-8000-00000000000e',
    'Jack Link''s Teriyaki Beef Jerky', 'Jack Link''s', 'Teriyaki beef jerky', '3.25 oz', 'Teriyaki',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111',
    5.49, 4.50, 6.50, 84, true, true, false, now(), 'dg-jack-teriyaki', 2
  ),
  (
    'cccc0001-0000-4000-8000-00000000000f',
    'Slim Jim', 'Slim Jim', 'Meat stick', 'Giant', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111',
    1.65, 1.25, 2.00, 65, true, true, false, now(), 'dg-slimjim', 5
  )
on conflict (id) do nothing;

-- Today's open lunch run session (refresh date on re-seed)
insert into public.lunch_run_sessions (
  id, date, store_id, open_time, cutoff_time, delivery_window, status, max_orders
) values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  current_date,
  '11111111-1111-1111-1111-111111111111',
  '07:00',
  '11:30',
  'Lunch period',
  'open',
  20
)
on conflict (id) do update set
  date = excluded.date,
  store_id = excluded.store_id,
  cutoff_time = excluded.cutoff_time,
  delivery_window = excluded.delivery_window,
  status = 'open',
  max_orders = excluded.max_orders;

-- After creating an Auth user in Supabase, link them:
-- insert into public.admins (id, email, display_name)
-- values ('YOUR-AUTH-USER-UUID', 'you@school.edu', 'Operator');
