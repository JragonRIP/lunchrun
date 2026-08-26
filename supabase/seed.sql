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

-- Products (54 catalog items, Dollar General store)
insert into public.products (
  id, name, brand, description, size, flavor, category_id, store_id,
  current_price, min_price, max_price, popularity, available, active, archived,
  last_price_update, external_product_id, max_quantity
) values
  (
    'cccc0001-0000-4000-8000-000000000001',
    'Monster Energy Ultra White', 'Monster', 'Zero sugar energy drink', '16 oz', 'Ultra White',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 98, true, true, false, now(), 'dg-monster-ultra-white', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000002',
    'Monster Energy Original', 'Monster', 'Classic green Monster', '16 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 90, true, true, false, now(), 'dg-monster-original', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000003',
    'Red Bull', 'Red Bull', 'Energy drink', '8.4 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 85, true, true, false, now(), 'dg-redbull', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000004',
    'Dr Pepper', 'Dr Pepper', 'Soda', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 80, true, true, false, now(), 'dg-drpepper-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000005',
    'Coca-Cola', 'Coca-Cola', 'Classic cola', '20 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 78, true, true, false, now(), 'dg-coke-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000006',
    'Gatorade', 'Gatorade', 'Sports drink', '20 oz', 'Fruit Punch',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    1.85, 1.57, 2.31, 70, true, true, false, now(), 'dg-gatorade', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000010',
    'Mountain Dew', 'Mountain Dew', 'Citrus soda', '20 fl oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    2.6, 2.21, 3.25, 76, true, true, false, now(), 'dg-mtn-dew-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000011',
    'Pepsi', 'Pepsi', 'Cola', '20 fl oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    2.6, 2.21, 3.25, 74, true, true, false, now(), 'dg-pepsi-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000012',
    '7UP Zero Sugar', '7UP', 'Lemon-lime soda', '20 fl oz', 'Zero Sugar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    2.5, 2.13, 3.13, 60, true, true, false, now(), 'dg-7up-zero-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000013',
    'Mug Root Beer', 'Mug', 'Root beer', '20 fl oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
    2.25, 1.91, 2.81, 62, true, true, false, now(), 'dg-mug-20', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000007',
    'Takis Fuego', 'Takis', 'Hot chili pepper tortilla chips', '9.9 oz', 'Fuego',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.15, 3.53, 5.19, 95, true, true, false, now(), 'dg-takis-fuego', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000008',
    'Doritos Nacho Cheese', 'Doritos', 'Tortilla chips', '9.25 oz', 'Nacho Cheese',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 75, true, true, false, now(), 'dg-doritos-nacho', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000009',
    'Cheetos Flamin'' Hot', 'Cheetos', 'Flamin'' Hot cheese snacks', '8.5 oz', 'Flamin'' Hot',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.15, 2.68, 3.94, 88, true, true, false, now(), 'dg-cheetos-fh', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000014',
    'Cheez-It Original Cheese Crackers', 'Cheez-It', 'Baked cheese crackers', '3 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    1.25, 1.06, 1.56, 86, true, true, false, now(), 'dg-cheezit-orig-3', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000015',
    'Cheez-It White Cheddar Crackers', 'Cheez-It', 'White cheddar crackers', '7 oz', 'White Cheddar',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 82, true, true, false, now(), 'dg-cheezit-white-7', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000016',
    'Munchies Cheese Fix Snack Mix', 'Munchies', 'Cheese snack mix', '8 oz', 'Cheese Fix',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.65, 3.1, 4.56, 79, true, true, false, now(), 'dg-munchies-cheese', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000017',
    'Lay''s Kettle Cooked Jalapeño Potato Chips', 'Lay''s', 'Kettle cooked jalapeño chips', '8 oz', 'Jalapeño',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    3.95, 3.36, 4.94, 81, true, true, false, now(), 'dg-lays-kettle-jal', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000018',
    'Ritz Sour Cream and Onion Toasted Chips', 'Ritz', 'Toasted chips', '8.1 oz', 'Sour Cream and Onion',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.35, 3.7, 5.44, 73, true, true, false, now(), 'dg-ritz-sco', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000019',
    'Chicken in a Biskit Original Crackers', 'Chicken in a Biskit', 'Chicken-flavored crackers', '7.5 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.25, 3.61, 5.31, 71, true, true, false, now(), 'dg-chicken-biskit', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001a',
    'Pringles Original Potato Crisps', 'Pringles', 'Stackable potato crisps', '2.3 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 84, true, true, false, now(), 'dg-pringles-orig', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000001b',
    'Tostitos Scoops Tortilla Chips', 'Tostitos', 'Scoop tortilla chips', '10 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '11111111-1111-1111-1111-111111111111',
    4.5, 3.83, 5.63, 77, true, true, false, now(), 'dg-tostitos-scoops', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001c',
    'Keebler Chips Deluxe Cookies with M&M''s', 'Keebler', 'Cookies with M&M''s', '9.75 oz', 'M&M''s',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.5, 2.98, 4.38, 78, true, true, false, now(), 'dg-keebler-deluxe-mm', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000001d',
    'CHIPS AHOY! Minis Go-Paks', 'CHIPS AHOY!', 'Mini chocolate chip cookies', '3.5 oz', 'Chocolate Chip',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 89, true, true, false, now(), 'dg-chipsahoy-minis', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000001e',
    'OREO Minis Go-Paks', 'OREO', 'Mini sandwich cookies', '3.5 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 91, true, true, false, now(), 'dg-oreo-minis', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000001f',
    'CHIPS AHOY! Chunky Cookies', 'CHIPS AHOY!', 'Chunky chocolate chip cookies', '11.75 oz', 'Chunky',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    4, 3.4, 5, 74, true, true, false, now(), 'dg-chipsahoy-chunky', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000020',
    'Clover Valley Strawberry Sugar Wafers', 'Clover Valley', 'Strawberry sugar wafers', '8 oz', 'Strawberry',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.65, 1.4, 2.06, 66, true, true, false, now(), 'dg-cv-strawberry-wafers', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000021',
    'Clover Valley Chewy Chocolate Chip Cookies', 'Clover Valley', 'Chewy chocolate chip cookies', '12 oz', 'Chocolate Chip',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 70, true, true, false, now(), 'dg-cv-chewy-chip', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000022',
    'Clover Valley Duplex Sandwich Creme Cookies', 'Clover Valley', 'Duplex creme cookies', '11.8 oz', 'Duplex',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 68, true, true, false, now(), 'dg-cv-duplex', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000023',
    'NILLA Wafers', 'NILLA', 'Vanilla wafer cookies', '11 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    4.95, 4.21, 6.19, 64, true, true, false, now(), 'dg-nilla-wafers', 2
  ),
  (
    'cccc0001-0000-4000-8000-000000000024',
    'Nutter Butter Peanut Butter Wafer Cookies', 'Nutter Butter', 'Peanut butter wafer cookies', '10.5 oz', 'Peanut Butter',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    5, 4.25, 6.25, 72, true, true, false, now(), 'dg-nutter-butter', 2
  ),
  (
    'cccc0001-0000-4000-8000-000000000025',
    'Keebler Fudge Stripes Cookies', 'Keebler', 'Fudge-striped shortbread cookies', '11.5 oz', 'Fudge Stripes',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '11111111-1111-1111-1111-111111111111',
    3.5, 2.98, 4.38, 76, true, true, false, now(), 'dg-keebler-fudge-stripes', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000000a',
    'Reese''s Peanut Butter Cups', 'Reese''s', 'Chocolate peanut butter cups', '1.5 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.45, 1.23, 1.81, 82, true, true, false, now(), 'dg-reeses', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000000b',
    'Sour Patch Kids', 'Sour Patch', 'Sour then sweet candy', '8 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.95, 2.51, 3.69, 72, true, true, false, now(), 'dg-sourpatch', 3
  ),
  (
    'cccc0001-0000-4000-8000-00000000000c',
    'Skittles', 'Skittles', 'Fruit candy', '7 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.85, 2.42, 3.56, 68, true, true, false, now(), 'dg-skittles', 3
  ),
  (
    'cccc0001-0000-4000-8000-000000000026',
    'Super Blow Pops Lollipops', 'Blow Pops', 'Gum-filled lollipop', '1 lollipop', 'Assorted',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    0.5, 0.43, 0.63, 87, true, true, false, now(), 'dg-blow-pop', 8
  ),
  (
    'cccc0001-0000-4000-8000-000000000027',
    'LIFE SAVERS 5 Flavors Gummy Candy', 'LIFE SAVERS', '5 flavors gummy candy', '3.22 oz', '5 Flavors',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 69, true, true, false, now(), 'dg-lifesavers-gummy', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000028',
    'KIT KAT Milk Chocolate Wafer Bar', 'KIT KAT', 'Chocolate wafer bar', '1.5 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.75, 1.49, 2.19, 88, true, true, false, now(), 'dg-kitkat', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000029',
    'REESE''S King Size Peanut Butter Cups', 'Reese''s', 'King size peanut butter cups', '2.8 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.75, 2.34, 3.44, 90, true, true, false, now(), 'dg-reeses-king', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000002a',
    'REESE''S THiNS Milk Chocolate Peanut Butter Cups', 'Reese''s', 'Thin peanut butter cups', '1.55 oz', 'THiNS',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 80, true, true, false, now(), 'dg-reeses-thins', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002b',
    'Lindt Lindor Milk Chocolate Truffle', 'Lindt', 'Milk chocolate truffle', '1 piece', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    0.85, 0.72, 1.06, 83, true, true, false, now(), 'dg-lindor', 6
  ),
  (
    'cccc0001-0000-4000-8000-00000000002c',
    'SNICKERS Original Share Size', 'SNICKERS', 'Chocolate peanut nougat bar', '3.29 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    2.65, 2.25, 3.31, 92, true, true, false, now(), 'dg-snickers-share', 4
  ),
  (
    'cccc0001-0000-4000-8000-00000000002d',
    'TWIX Caramel Cookie Candy Bar', 'TWIX', 'Caramel cookie candy bar', '1.79 oz', 'Caramel',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 85, true, true, false, now(), 'dg-twix', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002e',
    'M&M''S Milk Chocolate Peg Bag', 'M&M''S', 'Milk chocolate candies', '2.55 oz', 'Milk Chocolate',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 86, true, true, false, now(), 'dg-mms-milk', 5
  ),
  (
    'cccc0001-0000-4000-8000-00000000002f',
    'M&M''S Peanut Milk Chocolate Bag', 'M&M''S', 'Peanut chocolate candies', '2.55 oz', 'Peanut',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1.5, 1.27, 1.88, 87, true, true, false, now(), 'dg-mms-peanut', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000030',
    'Mike and Ike Tropical Typhoon', 'Mike and Ike', 'Chewy fruit candy', '0.78 oz', 'Tropical Typhoon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    0.25, 0.21, 0.31, 75, true, true, false, now(), 'dg-mikeike-tropical', 10
  ),
  (
    'cccc0001-0000-4000-8000-000000000031',
    'Mike and Ike Watermelon Chewy Candy', 'Mike and Ike', 'Chewy watermelon candy', '0.78 oz', 'Watermelon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    0.25, 0.21, 0.31, 74, true, true, false, now(), 'dg-mikeike-watermelon', 10
  ),
  (
    'cccc0001-0000-4000-8000-000000000032',
    'SweeTarts Giant Chewy Candy', 'SweeTarts', 'Giant chewy candy', '1.35 oz', 'Original',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 71, true, true, false, now(), 'dg-sweetarts-giant', 5
  ),
  (
    'cccc0001-0000-4000-8000-000000000033',
    'Albanese 12 Flavor Gummi Bears', 'Albanese', '12 flavor gummi bears', '3.5 oz', '12 Flavor',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 73, true, true, false, now(), 'dg-albanese-bears', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000034',
    'SOUR PATCH KIDS Peach Candy', 'SOUR PATCH KIDS', 'Peach sour candy', '3.56 oz', 'Peach',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 81, true, true, false, now(), 'dg-sourpatch-peach', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000035',
    'Sweet Smiles Peach Gummi Rings', 'Sweet Smiles', 'Peach gummi rings', '5 oz', 'Peach',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 67, true, true, false, now(), 'dg-ss-peach-rings', 4
  ),
  (
    'cccc0001-0000-4000-8000-000000000036',
    'Sweet Smiles Sour Neon Gummi Worms', 'Sweet Smiles', 'Sour neon gummi worms', '5 oz', 'Sour Neon',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '11111111-1111-1111-1111-111111111111',
    1, 0.85, 1.25, 70, true, true, false, now(), 'dg-ss-sour-worms', 4
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
