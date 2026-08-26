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

-- Products (113 catalog items, Dollar General store)
insert into public.products (
  id, name, brand, description, size, flavor, category_id, store_id,
  current_price, min_price, max_price, popularity, available, active, archived,
  last_price_update, external_product_id, max_quantity
) values
  (
    'cccc0001-0000-4000-8000-000000000002',
    'Monster Energy Original', 'Monster', 'Classic green Monster', '16 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 96, true, true, false, now(), 'dg-monster-original', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000001',
    'Monster Zero Ultra', 'Monster', 'Zero sugar, light citrus', '16 oz', 'Zero Ultra',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 98, true, true, false, now(), 'dg-monster-zero-ultra', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000040',
    'Monster Ultra Rosá', 'Monster', 'Zero sugar, fruity floral', '16 oz', 'Ultra Rosá',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 88, true, true, false, now(), 'dg-monster-ultra-rosa', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000041',
    'Monster Ultra Paradise', 'Monster', 'Zero sugar, island fruit', '16 oz', 'Ultra Paradise',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 87, true, true, false, now(), 'dg-monster-ultra-paradise', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000042',
    'Monster Ultra Red White & Blue Razz', 'Monster', 'Zero sugar, blue raspberry rocket-pop', '16 oz', 'Red White & Blue Razz',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 86, true, true, false, now(), 'dg-monster-ultra-rwb', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000043',
    'Juice Monster Mango Loco', 'Monster', 'Tropical mango energy drink', '16 oz', 'Mango Loco',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 84, true, true, false, now(), 'dg-monster-mango-loco', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000044',
    'Juice Monster Pacific Punch', 'Monster', 'Fruit punch energy drink', '16 oz', 'Pacific Punch',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 83, true, true, false, now(), 'dg-monster-pacific-punch', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000045',
    'Java Monster Mean Bean', 'Monster', 'Coffee and cream energy drink', '15 oz', 'Mean Bean',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 80, true, true, false, now(), 'dg-java-mean-bean', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000046',
    'Java Monster Loca Moca', 'Monster', 'Coffee mocha energy drink', '15 oz', 'Loca Moca',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 79, true, true, false, now(), 'dg-java-loca-moca', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000047',
    'Java Monster Irish Crème', 'Monster', 'Coffee Irish crème energy drink', '15 oz', 'Irish Crème',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 78, true, true, false, now(), 'dg-java-irish-creme', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000003',
    'Red Bull Original', 'Red Bull', 'Classic energy drink', '8.4 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 95, true, true, false, now(), 'dg-redbull', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000048',
    'Red Bull Sugarfree', 'Red Bull', 'Sugar-free energy drink', '8.4 oz', 'Sugarfree',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 90, true, true, false, now(), 'dg-redbull-sugarfree', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000049',
    'Red Bull Zero', 'Red Bull', 'Zero calorie energy drink', '8.4 oz', 'Zero',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 89, true, true, false, now(), 'dg-redbull-zero', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000004a',
    'Red Bull Winter Edition Pear Cinnamon', 'Red Bull', 'Pear cinnamon winter edition', '8.4 oz', 'Pear Cinnamon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 72, true, true, false, now(), 'dg-redbull-pear-cinnamon', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000004b',
    'Red Bull Green Edition Dragon Fruit', 'Red Bull', 'Dragon fruit edition', '8.4 oz', 'Dragon Fruit',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 82, true, true, false, now(), 'dg-redbull-dragon-fruit', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000004c',
    'Red Bull Sea Blue Edition Juneberry', 'Red Bull', 'Juneberry sea blue edition', '8.4 oz', 'Juneberry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 81, true, true, false, now(), 'dg-redbull-juneberry', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000004d',
    'Red Bull Yellow Edition Tropical', 'Red Bull', 'Tropical yellow edition', '8.4 oz', 'Tropical',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 83, true, true, false, now(), 'dg-redbull-tropical', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000004e',
    'Red Bull Blue Edition Blueberry', 'Red Bull', 'Blueberry edition', '8.4 oz', 'Blueberry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 84, true, true, false, now(), 'dg-redbull-blueberry', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000004f',
    'Red Bull Coconut Edition Coconut Berry', 'Red Bull', 'Coconut berry edition', '8.4 oz', 'Coconut Berry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 80, true, true, false, now(), 'dg-redbull-coconut-berry', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000050',
    'Red Bull Red Edition Watermelon', 'Red Bull', 'Watermelon edition', '8.4 oz', 'Watermelon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 85, true, true, false, now(), 'dg-redbull-watermelon', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000051',
    'Red Bull Peach Edition Peach Nectarine', 'Red Bull', 'Peach nectarine edition', '8.4 oz', 'Peach Nectarine',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 82, true, true, false, now(), 'dg-redbull-peach-nectarine', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000052',
    'Red Bull White Peach', 'Red Bull', 'White peach energy drink', '8.4 oz', 'White Peach',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 81, true, true, false, now(), 'dg-redbull-white-peach', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000053',
    'Red Bull Iced Vanilla Berry', 'Red Bull', 'Iced vanilla berry', '8.4 oz', 'Iced Vanilla Berry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 79, true, true, false, now(), 'dg-redbull-iced-vanilla-berry', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000054',
    'Red Bull Strawberry Apricot', 'Red Bull', 'Strawberry apricot', '8.4 oz', 'Strawberry Apricot',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 78, true, true, false, now(), 'dg-redbull-strawberry-apricot', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000055',
    'Red Bull Wild Berries', 'Red Bull', 'Wild berries', '8.4 oz', 'Wild Berries',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 80, true, true, false, now(), 'dg-redbull-wild-berries', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000008',
    'Doritos Nacho Cheese', 'Doritos', 'Tortilla chips', '9.25 oz', 'Nacho Cheese',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 92, true, true, false, now(), 'dg-doritos-nacho', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000060',
    'Doritos Cool Ranch', 'Doritos', 'Tortilla chips', '9.25 oz', 'Cool Ranch',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 88, true, true, false, now(), 'dg-doritos-cool-ranch', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000061',
    'Doritos Sweet & Tangy BBQ', 'Doritos', 'Tortilla chips', '9.25 oz', 'Sweet & Tangy BBQ',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 80, true, true, false, now(), 'dg-doritos-bbq', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000062',
    'Doritos Flamin'' Hot Nacho', 'Doritos', 'Flamin'' Hot tortilla chips', '9.25 oz', 'Flamin'' Hot Nacho',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 90, true, true, false, now(), 'dg-doritos-fh-nacho', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000063',
    'Cheetos Crunchy Cheese', 'Cheetos', 'Crunchy cheese snacks', '8.5 oz', 'Crunchy Cheese',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 86, true, true, false, now(), 'dg-cheetos-crunchy', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000064',
    'Cheetos Minis Cheddar Cheese', 'Cheetos', 'Mini cheddar cheese snacks', '1.25 oz', 'Minis Cheddar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 78, true, true, false, now(), 'dg-cheetos-minis', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000065',
    'Cheetos Bold & Cheesy', 'Cheetos', 'Bold & cheesy snacks', '8 oz', 'Bold & Cheesy',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 77, true, true, false, now(), 'dg-cheetos-bold', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000066',
    'Cheetos Cheesy Jalapeño', 'Cheetos', 'Cheesy jalapeño snacks', '8 oz', 'Cheesy Jalapeño',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 81, true, true, false, now(), 'dg-cheetos-jal', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000009',
    'Cheetos Flamin'' Hot', 'Cheetos', 'Flamin'' Hot cheese snacks', '8.5 oz', 'Flamin'' Hot',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 91, true, true, false, now(), 'dg-cheetos-fh', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000067',
    'Lay''s Classic Potato Chips', 'Lay''s', 'Classic potato chips', '8 oz', 'Classic',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.25, 2.76, 4.06, 85, true, true, false, now(), 'dg-lays-classic', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000017',
    'Lay''s Kettle Cooked Jalapeño', 'Lay''s', 'Kettle cooked jalapeño chips', '8 oz', 'Jalapeño',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.95, 3.36, 4.94, 83, true, true, false, now(), 'dg-lays-kettle-jal', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000068',
    'Ruffles Original', 'Ruffles', 'Ridged potato chips', '8.5 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.25, 2.76, 4.06, 79, true, true, false, now(), 'dg-ruffles-orig', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000069',
    'Fritos Original', 'Fritos', 'Corn chips', '9.25 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 76, true, true, false, now(), 'dg-fritos-orig', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000006a',
    'Fritos Flavor Twists Queso', 'Fritos', 'Queso flavor twists', '9 oz', 'Queso',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 74, true, true, false, now(), 'dg-fritos-queso', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001b',
    'Tostitos Scoops', 'Tostitos', 'Scoop tortilla chips', '10 oz', 'Scoops',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.5, 3.83, 5.63, 82, true, true, false, now(), 'dg-tostitos-scoops', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000006b',
    'Tostitos Original Restaurant Style', 'Tostitos', 'Restaurant style tortilla chips', '13 oz', 'Original Restaurant Style',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.5, 3.83, 5.63, 75, true, true, false, now(), 'dg-tostitos-restaurant', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001a',
    'Pringles Original', 'Pringles', 'Stackable potato crisps', '2.3 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 84, true, true, false, now(), 'dg-pringles-orig', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000006c',
    'Pringles Sour Cream & Onion', 'Pringles', 'Stackable potato crisps', '2.3 oz', 'Sour Cream & Onion',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 83, true, true, false, now(), 'dg-pringles-sco', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000007',
    'Takis Fuego', 'Takis', 'Hot chili pepper & lime tortilla chips', '9.9 oz', 'Fuego',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.15, 3.53, 5.19, 97, true, true, false, now(), 'dg-takis-fuego', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000016',
    'Munchies Cheese Fix', 'Munchies', 'Cheese snack mix', '8 oz', 'Cheese Fix',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.65, 3.1, 4.56, 79, true, true, false, now(), 'dg-munchies-cheese', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000006d',
    'Goldfish Cheddar', 'Goldfish', 'Cheddar crackers', '6.6 oz', 'Cheddar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 87, true, true, false, now(), 'dg-goldfish-cheddar', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000014',
    'Cheez-It Original', 'Cheez-It', 'Baked cheese crackers', '3 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 86, true, true, false, now(), 'dg-cheezit-orig-3', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000015',
    'Cheez-It White Cheddar', 'Cheez-It', 'White cheddar crackers', '7 oz', 'White Cheddar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 82, true, true, false, now(), 'dg-cheezit-white-7', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000018',
    'Ritz Toasted Chips Sour Cream & Onion', 'Ritz', 'Toasted chips', '8.1 oz', 'Sour Cream & Onion',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.35, 3.7, 5.44, 73, true, true, false, now(), 'dg-ritz-sco', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001e',
    'OREO Minis Original', 'OREO', 'Mini sandwich cookies', '3.5 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 91, true, true, false, now(), 'dg-oreo-minis', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000001d',
    'CHIPS AHOY! Minis Chocolate Chip', 'CHIPS AHOY!', 'Mini chocolate chip cookies', '3.5 oz', 'Chocolate Chip',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 89, true, true, false, now(), 'dg-chipsahoy-minis', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000006e',
    'CHIPS AHOY! Original Chocolate Chip', 'CHIPS AHOY!', 'Chocolate chip cookies', '13 oz', 'Original Chocolate Chip',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.75, 3.19, 4.69, 85, true, true, false, now(), 'dg-chipsahoy-orig', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001f',
    'CHIPS AHOY! Chunky Chocolatey Chip', 'CHIPS AHOY!', 'Chunky chocolate chip cookies', '11.75 oz', 'Chunky',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    4, 3.4, 5, 80, true, true, false, now(), 'dg-chipsahoy-chunky', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000006f',
    'CHIPS AHOY! Chewy Ice Cream Sandwich-Inspired', 'CHIPS AHOY!', 'Chewy ice cream sandwich-inspired cookies', '9.5 oz', 'Chewy Ice Cream Sandwich',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.75, 3.19, 4.69, 76, true, true, false, now(), 'dg-chipsahoy-ice-cream', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000024',
    'Nutter Butter Original Peanut Butter', 'Nutter Butter', 'Peanut butter sandwich cookies', '10.5 oz', 'Original Peanut Butter',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    5, 4.25, 6.25, 78, true, true, false, now(), 'dg-nutter-butter', 2
  ),
  (
    'cccc0001-0000-4000-8000-000000000025',
    'Keebler Fudge Stripes', 'Keebler', 'Fudge-striped shortbread cookies', '11.5 oz', 'Fudge Stripes',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.5, 2.98, 4.38, 81, true, true, false, now(), 'dg-keebler-fudge-stripes', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001c',
    'Keebler Chips Deluxe with M&M''s', 'Keebler', 'Cookies with M&M''s', '9.75 oz', 'M&M''s',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.5, 2.98, 4.38, 83, true, true, false, now(), 'dg-keebler-deluxe-mm', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000070',
    'Little Bites Chocolate Chip Muffins', 'Little Bites', 'Chocolate chip muffins', '8.25 oz', 'Chocolate Chip',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.95, 3.36, 4.94, 84, true, true, false, now(), 'dg-little-bites-chip', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000071',
    'Quaker Chewy Strawberry Yogurt', 'Quaker Chewy', 'Granola bar', '0.84 oz', 'Strawberry Yogurt',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    0.85, 0.72, 1.06, 72, true, true, false, now(), 'dg-quaker-strawberry', 6
  ),
  (
    'cccc0001-0000-4000-8000-000000000072',
    'Quaker Chewy Peanut Butter Chocolate Chip', 'Quaker Chewy', 'Granola bar', '0.84 oz', 'Peanut Butter Chocolate Chip',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    0.85, 0.72, 1.06, 74, true, true, false, now(), 'dg-quaker-pb-chip', 6
  ),
  (
    'cccc0001-0000-4000-8000-000000000073',
    'Nature Valley Crunchy Oats ''N Honey', 'Nature Valley', 'Crunchy granola bars', '1.5 oz', 'Oats ''N Honey',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 77, true, true, false, now(), 'dg-nature-valley-oats', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002e',
    'M&M''S Milk Chocolate', 'M&M''S', 'Milk chocolate candies', '2.55 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 88, true, true, false, now(), 'dg-mms-milk', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002f',
    'M&M''S Peanut', 'M&M''S', 'Peanut chocolate candies', '2.55 oz', 'Peanut',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 89, true, true, false, now(), 'dg-mms-peanut', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000029',
    'REESE''S King Size Peanut Butter Cups', 'Reese''s', 'King size peanut butter cups', '2.8 oz', 'King Size',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 93, true, true, false, now(), 'dg-reeses-king', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000002a',
    'REESE''S THiNS Peanut Butter Cups', 'Reese''s', 'Thin peanut butter cups', '1.55 oz', 'THiNS',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 84, true, true, false, now(), 'dg-reeses-thins', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000028',
    'KIT KAT Milk Chocolate', 'KIT KAT', 'Chocolate wafer bar', '1.5 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 90, true, true, false, now(), 'dg-kitkat', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002c',
    'SNICKERS Original', 'SNICKERS', 'Chocolate peanut nougat bar', '1.86 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 94, true, true, false, now(), 'dg-snickers', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002d',
    'TWIX Caramel Cookie', 'TWIX', 'Caramel cookie candy bar', '1.79 oz', 'Caramel',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 87, true, true, false, now(), 'dg-twix', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000027',
    'LIFE SAVERS Gummies 5 Flavors', 'LIFE SAVERS', '5 flavors gummy candy', '3.22 oz', '5 Flavors',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 75, true, true, false, now(), 'dg-lifesavers-gummy', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000030',
    'Mike and Ike Tropical Typhoon', 'Mike and Ike', 'Chewy fruit candy', '0.78 oz', 'Tropical Typhoon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    0.25, 0.21, 0.31, 76, true, true, false, now(), 'dg-mikeike-tropical', 10
  ),
  (
    'cccc0001-0000-4000-8000-000000000031',
    'Mike and Ike Watermelon', 'Mike and Ike', 'Chewy watermelon candy', '0.78 oz', 'Watermelon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    0.25, 0.21, 0.31, 75, true, true, false, now(), 'dg-mikeike-watermelon', 10
  ),
  (
    'cccc0001-0000-4000-8000-000000000074',
    'Mike and Ike Mega Mix Sour', 'Mike and Ike', 'Sour chewy candy mix', '5 oz', 'Mega Mix Sour',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 73, true, true, false, now(), 'dg-mikeike-mega-sour', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000000b',
    'SOUR PATCH KIDS Original Assorted Fruit', 'SOUR PATCH KIDS', 'Sour then sweet candy', '3.56 oz', 'Original Assorted Fruit',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 86, true, true, false, now(), 'dg-sourpatch', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000034',
    'SOUR PATCH KIDS Peach', 'SOUR PATCH KIDS', 'Peach sour candy', '3.56 oz', 'Peach',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 85, true, true, false, now(), 'dg-sourpatch-peach', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000032',
    'SweeTarts Giant Chewy', 'SweeTarts', 'Giant chewy candy', '1.35 oz', 'Giant Chewy',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 74, true, true, false, now(), 'dg-sweetarts-giant', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000075',
    'SweeTarts Original', 'SweeTarts', 'Tangy candy', '5 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 72, true, true, false, now(), 'dg-sweetarts-orig', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000033',
    'Albanese Gummi Bears 12 Flavor', 'Albanese', '12 flavor gummi bears', '3.5 oz', '12 Flavor',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 77, true, true, false, now(), 'dg-albanese-bears', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000035',
    'Sweet Smiles Peach Gummi Rings', 'Sweet Smiles', 'Peach gummi rings', '5 oz', 'Peach',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 70, true, true, false, now(), 'dg-ss-peach-rings', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000036',
    'Sweet Smiles Sour Neon Gummi Worms', 'Sweet Smiles', 'Sour neon gummi worms', '5 oz', 'Sour Neon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 71, true, true, false, now(), 'dg-ss-sour-worms', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000005',
    'Coca-Cola Original', 'Coca-Cola', 'Classic cola', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 90, true, true, false, now(), 'dg-coke-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000076',
    'Coca-Cola Vanilla', 'Coca-Cola', 'Vanilla cola', '20 oz', 'Vanilla',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 74, true, true, false, now(), 'dg-coke-vanilla', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000077',
    'Diet Coke', 'Coca-Cola', 'Diet cola', '20 oz', 'Diet Coke',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 78, true, true, false, now(), 'dg-diet-coke', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000078',
    'Sprite Original Lemon-Lime', 'Sprite', 'Lemon-lime soda', '20 oz', 'Original Lemon-Lime',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 84, true, true, false, now(), 'dg-sprite', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000004',
    'Dr Pepper Original', 'Dr Pepper', 'Soda', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 88, true, true, false, now(), 'dg-drpepper-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000079',
    'Dr Pepper Cherry', 'Dr Pepper', 'Cherry soda', '20 oz', 'Cherry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 80, true, true, false, now(), 'dg-drpepper-cherry', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000007a',
    'Dr Pepper Cream Soda', 'Dr Pepper', 'Cream soda', '20 oz', 'Cream Soda',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 76, true, true, false, now(), 'dg-drpepper-cream', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000007b',
    'Diet Dr Pepper', 'Dr Pepper', 'Diet soda', '20 oz', 'Diet',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 73, true, true, false, now(), 'dg-diet-drpepper', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000011',
    'Pepsi Original', 'Pepsi', 'Cola', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 82, true, true, false, now(), 'dg-pepsi-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000007c',
    'Diet Pepsi', 'Pepsi', 'Diet cola', '20 oz', 'Diet Pepsi',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 72, true, true, false, now(), 'dg-diet-pepsi', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000007d',
    'Pepsi Wild Cherry', 'Pepsi', 'Wild cherry cola', '20 oz', 'Wild Cherry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 75, true, true, false, now(), 'dg-pepsi-wild-cherry', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000010',
    'Mountain Dew Original', 'Mountain Dew', 'Citrus soda', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 86, true, true, false, now(), 'dg-mtn-dew-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000007e',
    'Mountain Dew Code Red', 'Mountain Dew', 'Cherry citrus soda', '20 oz', 'Code Red',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 81, true, true, false, now(), 'dg-mtn-dew-code-red', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000007f',
    'Mountain Dew Diet', 'Mountain Dew', 'Diet citrus soda', '20 oz', 'Diet',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 68, true, true, false, now(), 'dg-mtn-dew-diet', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000080',
    'Mountain Dew Zero Sugar', 'Mountain Dew', 'Zero sugar citrus soda', '20 oz', 'Zero Sugar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 74, true, true, false, now(), 'dg-mtn-dew-zero', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000081',
    '7UP Lemon-Lime', '7UP', 'Lemon-lime soda', '20 oz', 'Lemon-Lime',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 70, true, true, false, now(), 'dg-7up', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000012',
    '7UP Zero Sugar', '7UP', 'Zero sugar lemon-lime soda', '20 oz', 'Zero Sugar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 69, true, true, false, now(), 'dg-7up-zero-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000013',
    'Mug Root Beer', 'Mug', 'Root beer', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 71, true, true, false, now(), 'dg-mug-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000082',
    'Starry Lemon-Lime', 'Starry', 'Lemon-lime soda', '20 oz', 'Lemon-Lime',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 73, true, true, false, now(), 'dg-starry', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000006',
    'Gatorade Frost Glacier Cherry', 'Gatorade', 'Sports drink', '20 oz', 'Frost Glacier Cherry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 85, true, true, false, now(), 'dg-gatorade-glacier-cherry', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000083',
    'Gatorade Orange', 'Gatorade', 'Sports drink', '20 oz', 'Orange',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 83, true, true, false, now(), 'dg-gatorade-orange', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000084',
    'Gatorade Cool Blue', 'Gatorade', 'Sports drink', '20 oz', 'Cool Blue',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 84, true, true, false, now(), 'dg-gatorade-cool-blue', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000085',
    'Propel Kiwi Strawberry Zero Sugar', 'Propel', 'Zero sugar fitness water', '20 oz', 'Kiwi Strawberry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.65, 1.4, 2.06, 70, true, true, false, now(), 'dg-propel-kiwi-strawberry', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000086',
    'Capri Sun Fruit Punch', 'Capri Sun', 'Juice pouch', '6 oz', 'Fruit Punch',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    0.75, 0.64, 0.94, 80, true, true, false, now(), 'dg-caprisun-fruit-punch', 6
  ),
  (
    'cccc0001-0000-4000-8000-000000000087',
    'Capri Sun Pacific Cooler', 'Capri Sun', 'Juice pouch', '6 oz', 'Pacific Cooler',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    0.75, 0.64, 0.94, 78, true, true, false, now(), 'dg-caprisun-pacific', 6
  ),
  (
    'cccc0001-0000-4000-8000-000000000088',
    'Capri Sun Wild Cherry', 'Capri Sun', 'Juice pouch', '6 oz', 'Wild Cherry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    0.75, 0.64, 0.94, 77, true, true, false, now(), 'dg-caprisun-wild-cherry', 6
  ),
  (
    'cccc0001-0000-4000-8000-000000000089',
    'Capri Sun Lemonade', 'Capri Sun', 'Juice pouch', '6 oz', 'Lemonade',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    0.75, 0.64, 0.94, 76, true, true, false, now(), 'dg-caprisun-lemonade', 6
  ),
  (
    'cccc0001-0000-4000-8000-00000000008a',
    'Kool-Aid Bursts Berry Blue', 'Kool-Aid Bursts', 'Juice drink', '6.75 oz', 'Berry Blue',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    0.85, 0.72, 1.06, 79, true, true, false, now(), 'dg-koolaid-bursts-blue', 6
  ),
  (
    'cccc0001-0000-4000-8000-00000000008b',
    'Kool-Aid Jammers Tropical Punch', 'Kool-Aid Jammers', 'Juice drink', '6 oz', 'Tropical Punch',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    0.85, 0.72, 1.06, 78, true, true, false, now(), 'dg-koolaid-jammers-tropical', 6
  ),
  (
    'cccc0001-0000-4000-8000-00000000008c',
    'Mott''s Original Apple Juice', 'Mott''s', 'Apple juice', '6.75 oz', 'Original Apple',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 74, true, true, false, now(), 'dg-motts-apple', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000008d',
    'Bubly Lime', 'Bubly', 'Sparkling water', '12 oz', 'Lime',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 72, true, true, false, now(), 'dg-bubly-lime', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000000d',
    'Jack Link''s Original Beef Jerky', 'Jack Link''s', 'Beef jerky', '3.25 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111',
    5.49, 4.67, 6.86, 77, true, true, false, now(), 'dg-jack-original', 2
  ),
  (
    'cccc0001-0000-4000-8000-00000000000e',
    'Jack Link''s Teriyaki Beef Jerky', 'Jack Link''s', 'Teriyaki beef jerky', '3.25 oz', 'Teriyaki',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111',
    5.49, 4.67, 6.86, 84, true, true, false, now(), 'dg-jack-teriyaki', 2
  ),
  (
    'cccc0001-0000-4000-8000-00000000000f',
    'Slim Jim', 'Slim Jim', 'Meat stick', 'Giant', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '11111111-1111-1111-1111-111111111111',
    1.65, 1.4, 2.06, 65, true, true, false, now(), 'dg-slimjim', 5
  )
on conflict (id) do update set
  name = excluded.name,
  brand = excluded.brand,
  description = excluded.description,
  size = excluded.size,
  flavor = excluded.flavor,
  category_id = excluded.category_id,
  store_id = excluded.store_id,
  current_price = excluded.current_price,
  min_price = excluded.min_price,
  max_price = excluded.max_price,
  popularity = excluded.popularity,
  available = excluded.available,
  active = excluded.active,
  archived = excluded.archived,
  last_price_update = excluded.last_price_update,
  external_product_id = excluded.external_product_id,
  max_quantity = excluded.max_quantity;

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
