/**
 * Upserts the Lunch Run snack catalog into Supabase.
 * Usage: node --env-file=.env.local scripts/upsert-catalog.mjs
 */
import { createClient } from "@supabase/supabase-js";

const STORE = "11111111-1111-1111-1111-111111111111";
const CAT = {
  drinks: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  energy: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
  chips: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
  candy: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
  jerky: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5",
  snacks: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6",
};

function band(price) {
  return {
    min_price: Math.round(price * 0.85 * 100) / 100,
    max_price: Math.round(price * 1.25 * 100) / 100,
  };
}

function p(id, name, brand, description, size, flavor, category_id, price, popularity, max_quantity, external) {
  const { min_price, max_price } = band(price);
  return {
    id,
    name,
    brand,
    description,
    size,
    flavor,
    category_id,
    store_id: STORE,
    current_price: price,
    min_price,
    max_price,
    popularity,
    available: true,
    active: true,
    archived: false,
    last_price_update: new Date().toISOString(),
    external_product_id: external,
    max_quantity,
  };
}

/** Keep-list snacks + core catalog staples */
export const CATALOG = [
  // Monster — 16 oz cans
  p("cccc0001-0000-4000-8000-000000000002", "Monster Energy Original", "Monster", "Classic green Monster", "16 oz", "Original", CAT.energy, 2.85, 96, 4, "dg-monster-original"),
  p("cccc0001-0000-4000-8000-000000000001", "Monster Zero Ultra", "Monster", "Zero sugar, light citrus", "16 oz", "Zero Ultra", CAT.energy, 2.85, 98, 4, "dg-monster-zero-ultra"),
  p("cccc0001-0000-4000-8000-000000000040", "Monster Ultra Rosá", "Monster", "Zero sugar, fruity floral", "16 oz", "Ultra Rosá", CAT.energy, 2.85, 88, 4, "dg-monster-ultra-rosa"),
  p("cccc0001-0000-4000-8000-000000000041", "Monster Ultra Paradise", "Monster", "Zero sugar, island fruit", "16 oz", "Ultra Paradise", CAT.energy, 2.85, 87, 4, "dg-monster-ultra-paradise"),
  p("cccc0001-0000-4000-8000-000000000042", "Monster Ultra Red White & Blue Razz", "Monster", "Zero sugar, blue raspberry rocket-pop", "16 oz", "Red White & Blue Razz", CAT.energy, 2.85, 86, 4, "dg-monster-ultra-rwb"),
  p("cccc0001-0000-4000-8000-000000000043", "Juice Monster Mango Loco", "Monster", "Tropical mango energy drink", "16 oz", "Mango Loco", CAT.energy, 2.95, 84, 4, "dg-monster-mango-loco"),
  p("cccc0001-0000-4000-8000-000000000044", "Juice Monster Pacific Punch", "Monster", "Fruit punch energy drink", "16 oz", "Pacific Punch", CAT.energy, 2.95, 83, 4, "dg-monster-pacific-punch"),
  p("cccc0001-0000-4000-8000-000000000045", "Java Monster Mean Bean", "Monster", "Coffee and cream energy drink", "15 oz", "Mean Bean", CAT.energy, 3.15, 80, 4, "dg-java-mean-bean"),
  p("cccc0001-0000-4000-8000-000000000046", "Java Monster Loca Moca", "Monster", "Coffee mocha energy drink", "15 oz", "Loca Moca", CAT.energy, 3.15, 79, 4, "dg-java-loca-moca"),
  p("cccc0001-0000-4000-8000-000000000047", "Java Monster Irish Crème", "Monster", "Coffee Irish crème energy drink", "15 oz", "Irish Crème", CAT.energy, 3.15, 78, 4, "dg-java-irish-creme"),
  // Red Bull — 8.4 oz cans
  p("cccc0001-0000-4000-8000-000000000003", "Red Bull Original", "Red Bull", "Classic energy drink", "8.4 oz", "Original", CAT.energy, 2.75, 95, 4, "dg-redbull"),
  p("cccc0001-0000-4000-8000-000000000048", "Red Bull Sugarfree", "Red Bull", "Sugar-free energy drink", "8.4 oz", "Sugarfree", CAT.energy, 2.75, 90, 4, "dg-redbull-sugarfree"),
  p("cccc0001-0000-4000-8000-000000000049", "Red Bull Zero", "Red Bull", "Zero calorie energy drink", "8.4 oz", "Zero", CAT.energy, 2.75, 89, 4, "dg-redbull-zero"),
  p("cccc0001-0000-4000-8000-00000000004a", "Red Bull Winter Edition Pear Cinnamon", "Red Bull", "Pear cinnamon winter edition", "8.4 oz", "Pear Cinnamon", CAT.energy, 2.95, 72, 4, "dg-redbull-pear-cinnamon"),
  p("cccc0001-0000-4000-8000-00000000004b", "Red Bull Green Edition Dragon Fruit", "Red Bull", "Dragon fruit edition", "8.4 oz", "Dragon Fruit", CAT.energy, 2.95, 82, 4, "dg-redbull-dragon-fruit"),
  p("cccc0001-0000-4000-8000-00000000004c", "Red Bull Sea Blue Edition Juneberry", "Red Bull", "Juneberry sea blue edition", "8.4 oz", "Juneberry", CAT.energy, 2.95, 81, 4, "dg-redbull-juneberry"),
  p("cccc0001-0000-4000-8000-00000000004d", "Red Bull Yellow Edition Tropical", "Red Bull", "Tropical yellow edition", "8.4 oz", "Tropical", CAT.energy, 2.95, 83, 4, "dg-redbull-tropical"),
  p("cccc0001-0000-4000-8000-00000000004e", "Red Bull Blue Edition Blueberry", "Red Bull", "Blueberry edition", "8.4 oz", "Blueberry", CAT.energy, 2.95, 84, 4, "dg-redbull-blueberry"),
  p("cccc0001-0000-4000-8000-00000000004f", "Red Bull Coconut Edition Coconut Berry", "Red Bull", "Coconut berry edition", "8.4 oz", "Coconut Berry", CAT.energy, 2.95, 80, 4, "dg-redbull-coconut-berry"),
  p("cccc0001-0000-4000-8000-000000000050", "Red Bull Red Edition Watermelon", "Red Bull", "Watermelon edition", "8.4 oz", "Watermelon", CAT.energy, 2.95, 85, 4, "dg-redbull-watermelon"),
  p("cccc0001-0000-4000-8000-000000000051", "Red Bull Peach Edition Peach Nectarine", "Red Bull", "Peach nectarine edition", "8.4 oz", "Peach Nectarine", CAT.energy, 2.95, 82, 4, "dg-redbull-peach-nectarine"),
  p("cccc0001-0000-4000-8000-000000000052", "Red Bull White Peach", "Red Bull", "White peach energy drink", "8.4 oz", "White Peach", CAT.energy, 2.95, 81, 4, "dg-redbull-white-peach"),
  p("cccc0001-0000-4000-8000-000000000053", "Red Bull Iced Vanilla Berry", "Red Bull", "Iced vanilla berry", "8.4 oz", "Iced Vanilla Berry", CAT.energy, 2.95, 79, 4, "dg-redbull-iced-vanilla-berry"),
  p("cccc0001-0000-4000-8000-000000000054", "Red Bull Strawberry Apricot", "Red Bull", "Strawberry apricot", "8.4 oz", "Strawberry Apricot", CAT.energy, 2.95, 78, 4, "dg-redbull-strawberry-apricot"),
  p("cccc0001-0000-4000-8000-000000000055", "Red Bull Wild Berries", "Red Bull", "Wild berries", "8.4 oz", "Wild Berries", CAT.energy, 2.95, 80, 4, "dg-redbull-wild-berries"),
  // Drinks (existing + new)
  p("cccc0001-0000-4000-8000-000000000004", "Dr Pepper", "Dr Pepper", "Soda", "20 oz", "Original", CAT.drinks, 1.75, 80, 4, "dg-drpepper-20"),
  p("cccc0001-0000-4000-8000-000000000005", "Coca-Cola", "Coca-Cola", "Classic cola", "20 oz", "Original", CAT.drinks, 1.75, 78, 4, "dg-coke-20"),
  p("cccc0001-0000-4000-8000-000000000006", "Gatorade", "Gatorade", "Sports drink", "20 oz", "Fruit Punch", CAT.drinks, 1.85, 70, 4, "dg-gatorade"),
  p("cccc0001-0000-4000-8000-000000000010", "Mountain Dew", "Mountain Dew", "Citrus soda", "20 fl oz", "Original", CAT.drinks, 2.6, 76, 4, "dg-mtn-dew-20"),
  p("cccc0001-0000-4000-8000-000000000011", "Pepsi", "Pepsi", "Cola", "20 fl oz", "Original", CAT.drinks, 2.6, 74, 4, "dg-pepsi-20"),
  p("cccc0001-0000-4000-8000-000000000012", "7UP Zero Sugar", "7UP", "Lemon-lime soda", "20 fl oz", "Zero Sugar", CAT.drinks, 2.5, 60, 4, "dg-7up-zero-20"),
  p("cccc0001-0000-4000-8000-000000000013", "Mug Root Beer", "Mug", "Root beer", "20 fl oz", "Original", CAT.drinks, 2.25, 62, 4, "dg-mug-20"),
  // Chips
  p("cccc0001-0000-4000-8000-000000000007", "Takis Fuego", "Takis", "Hot chili pepper tortilla chips", "9.9 oz", "Fuego", CAT.chips, 4.15, 95, 3, "dg-takis-fuego"),
  p("cccc0001-0000-4000-8000-000000000008", "Doritos Nacho Cheese", "Doritos", "Tortilla chips", "9.25 oz", "Nacho Cheese", CAT.chips, 3.15, 75, 3, "dg-doritos-nacho"),
  p("cccc0001-0000-4000-8000-000000000009", "Cheetos Flamin' Hot", "Cheetos", "Flamin' Hot cheese snacks", "8.5 oz", "Flamin' Hot", CAT.chips, 3.15, 88, 3, "dg-cheetos-fh"),
  p("cccc0001-0000-4000-8000-000000000014", "Cheez-It Original Cheese Crackers", "Cheez-It", "Baked cheese crackers", "3 oz", "Original", CAT.chips, 1.25, 86, 4, "dg-cheezit-orig-3"),
  p("cccc0001-0000-4000-8000-000000000015", "Cheez-It White Cheddar Crackers", "Cheez-It", "White cheddar crackers", "7 oz", "White Cheddar", CAT.chips, 2.75, 82, 3, "dg-cheezit-white-7"),
  p("cccc0001-0000-4000-8000-000000000016", "Munchies Cheese Fix Snack Mix", "Munchies", "Cheese snack mix", "8 oz", "Cheese Fix", CAT.chips, 3.65, 79, 3, "dg-munchies-cheese"),
  p("cccc0001-0000-4000-8000-000000000017", "Lay's Kettle Cooked Jalapeño Potato Chips", "Lay's", "Kettle cooked jalapeño chips", "8 oz", "Jalapeño", CAT.chips, 3.95, 81, 3, "dg-lays-kettle-jal"),
  p("cccc0001-0000-4000-8000-000000000018", "Ritz Sour Cream and Onion Toasted Chips", "Ritz", "Toasted chips", "8.1 oz", "Sour Cream and Onion", CAT.chips, 4.35, 73, 3, "dg-ritz-sco"),
  p("cccc0001-0000-4000-8000-000000000019", "Chicken in a Biskit Original Crackers", "Chicken in a Biskit", "Chicken-flavored crackers", "7.5 oz", "Original", CAT.chips, 4.25, 71, 3, "dg-chicken-biskit"),
  p("cccc0001-0000-4000-8000-00000000001a", "Pringles Original Potato Crisps", "Pringles", "Stackable potato crisps", "2.3 oz", "Original", CAT.chips, 1.75, 84, 4, "dg-pringles-orig"),
  p("cccc0001-0000-4000-8000-00000000001b", "Tostitos Scoops Tortilla Chips", "Tostitos", "Scoop tortilla chips", "10 oz", "Original", CAT.chips, 4.5, 77, 3, "dg-tostitos-scoops"),
  // Cookies / snacks
  p("cccc0001-0000-4000-8000-00000000001c", "Keebler Chips Deluxe Cookies with M&M's", "Keebler", "Cookies with M&M's", "9.75 oz", "M&M's", CAT.snacks, 3.5, 78, 3, "dg-keebler-deluxe-mm"),
  p("cccc0001-0000-4000-8000-00000000001d", "CHIPS AHOY! Minis Go-Paks", "CHIPS AHOY!", "Mini chocolate chip cookies", "3.5 oz", "Chocolate Chip", CAT.snacks, 1.5, 89, 4, "dg-chipsahoy-minis"),
  p("cccc0001-0000-4000-8000-00000000001e", "OREO Minis Go-Paks", "OREO", "Mini sandwich cookies", "3.5 oz", "Original", CAT.snacks, 1.5, 91, 4, "dg-oreo-minis"),
  p("cccc0001-0000-4000-8000-00000000001f", "CHIPS AHOY! Chunky Cookies", "CHIPS AHOY!", "Chunky chocolate chip cookies", "11.75 oz", "Chunky", CAT.snacks, 4.0, 74, 3, "dg-chipsahoy-chunky"),
  p("cccc0001-0000-4000-8000-000000000020", "Clover Valley Strawberry Sugar Wafers", "Clover Valley", "Strawberry sugar wafers", "8 oz", "Strawberry", CAT.snacks, 1.65, 66, 4, "dg-cv-strawberry-wafers"),
  p("cccc0001-0000-4000-8000-000000000021", "Clover Valley Chewy Chocolate Chip Cookies", "Clover Valley", "Chewy chocolate chip cookies", "12 oz", "Chocolate Chip", CAT.snacks, 2.75, 70, 3, "dg-cv-chewy-chip"),
  p("cccc0001-0000-4000-8000-000000000022", "Clover Valley Duplex Sandwich Creme Cookies", "Clover Valley", "Duplex creme cookies", "11.8 oz", "Duplex", CAT.snacks, 1.5, 68, 3, "dg-cv-duplex"),
  p("cccc0001-0000-4000-8000-000000000023", "NILLA Wafers", "NILLA", "Vanilla wafer cookies", "11 oz", "Original", CAT.snacks, 4.95, 64, 2, "dg-nilla-wafers"),
  p("cccc0001-0000-4000-8000-000000000024", "Nutter Butter Peanut Butter Wafer Cookies", "Nutter Butter", "Peanut butter wafer cookies", "10.5 oz", "Peanut Butter", CAT.snacks, 5.0, 72, 2, "dg-nutter-butter"),
  p("cccc0001-0000-4000-8000-000000000025", "Keebler Fudge Stripes Cookies", "Keebler", "Fudge-striped shortbread cookies", "11.5 oz", "Fudge Stripes", CAT.snacks, 3.5, 76, 3, "dg-keebler-fudge-stripes"),
  // Candy (existing + new)
  p("cccc0001-0000-4000-8000-00000000000a", "Reese's Peanut Butter Cups", "Reese's", "Chocolate peanut butter cups", "1.5 oz", "Milk Chocolate", CAT.candy, 1.45, 82, 5, "dg-reeses"),
  p("cccc0001-0000-4000-8000-00000000000b", "Sour Patch Kids", "Sour Patch", "Sour then sweet candy", "8 oz", "Original", CAT.candy, 2.95, 72, 3, "dg-sourpatch"),
  p("cccc0001-0000-4000-8000-00000000000c", "Skittles", "Skittles", "Fruit candy", "7 oz", "Original", CAT.candy, 2.85, 68, 3, "dg-skittles"),
  p("cccc0001-0000-4000-8000-000000000026", "Super Blow Pops Lollipops", "Blow Pops", "Gum-filled lollipop", "1 lollipop", "Assorted", CAT.candy, 0.5, 87, 8, "dg-blow-pop"),
  p("cccc0001-0000-4000-8000-000000000027", "LIFE SAVERS 5 Flavors Gummy Candy", "LIFE SAVERS", "5 flavors gummy candy", "3.22 oz", "5 Flavors", CAT.candy, 1.5, 69, 4, "dg-lifesavers-gummy"),
  p("cccc0001-0000-4000-8000-000000000028", "KIT KAT Milk Chocolate Wafer Bar", "KIT KAT", "Chocolate wafer bar", "1.5 oz", "Milk Chocolate", CAT.candy, 1.75, 88, 5, "dg-kitkat"),
  p("cccc0001-0000-4000-8000-000000000029", "REESE'S King Size Peanut Butter Cups", "Reese's", "King size peanut butter cups", "2.8 oz", "Milk Chocolate", CAT.candy, 2.75, 90, 4, "dg-reeses-king"),
  p("cccc0001-0000-4000-8000-00000000002a", "REESE'S THiNS Milk Chocolate Peanut Butter Cups", "Reese's", "Thin peanut butter cups", "1.55 oz", "THiNS", CAT.candy, 1.5, 80, 5, "dg-reeses-thins"),
  p("cccc0001-0000-4000-8000-00000000002b", "Lindt Lindor Milk Chocolate Truffle", "Lindt", "Milk chocolate truffle", "1 piece", "Milk Chocolate", CAT.candy, 0.85, 83, 6, "dg-lindor"),
  p("cccc0001-0000-4000-8000-00000000002c", "SNICKERS Original Share Size", "SNICKERS", "Chocolate peanut nougat bar", "3.29 oz", "Original", CAT.candy, 2.65, 92, 4, "dg-snickers-share"),
  p("cccc0001-0000-4000-8000-00000000002d", "TWIX Caramel Cookie Candy Bar", "TWIX", "Caramel cookie candy bar", "1.79 oz", "Caramel", CAT.candy, 1.5, 85, 5, "dg-twix"),
  p("cccc0001-0000-4000-8000-00000000002e", "M&M'S Milk Chocolate Peg Bag", "M&M'S", "Milk chocolate candies", "2.55 oz", "Milk Chocolate", CAT.candy, 1.5, 86, 5, "dg-mms-milk"),
  p("cccc0001-0000-4000-8000-00000000002f", "M&M'S Peanut Milk Chocolate Bag", "M&M'S", "Peanut chocolate candies", "2.55 oz", "Peanut", CAT.candy, 1.5, 87, 5, "dg-mms-peanut"),
  p("cccc0001-0000-4000-8000-000000000030", "Mike and Ike Tropical Typhoon", "Mike and Ike", "Chewy fruit candy", "0.78 oz", "Tropical Typhoon", CAT.candy, 0.25, 75, 10, "dg-mikeike-tropical"),
  p("cccc0001-0000-4000-8000-000000000031", "Mike and Ike Watermelon Chewy Candy", "Mike and Ike", "Chewy watermelon candy", "0.78 oz", "Watermelon", CAT.candy, 0.25, 74, 10, "dg-mikeike-watermelon"),
  p("cccc0001-0000-4000-8000-000000000032", "SweeTarts Giant Chewy Candy", "SweeTarts", "Giant chewy candy", "1.35 oz", "Original", CAT.candy, 1.0, 71, 5, "dg-sweetarts-giant"),
  p("cccc0001-0000-4000-8000-000000000033", "Albanese 12 Flavor Gummi Bears", "Albanese", "12 flavor gummi bears", "3.5 oz", "12 Flavor", CAT.candy, 1.0, 73, 4, "dg-albanese-bears"),
  p("cccc0001-0000-4000-8000-000000000034", "SOUR PATCH KIDS Peach Candy", "SOUR PATCH KIDS", "Peach sour candy", "3.56 oz", "Peach", CAT.candy, 1.0, 81, 4, "dg-sourpatch-peach"),
  p("cccc0001-0000-4000-8000-000000000035", "Sweet Smiles Peach Gummi Rings", "Sweet Smiles", "Peach gummi rings", "5 oz", "Peach", CAT.candy, 1.0, 67, 4, "dg-ss-peach-rings"),
  p("cccc0001-0000-4000-8000-000000000036", "Sweet Smiles Sour Neon Gummi Worms", "Sweet Smiles", "Sour neon gummi worms", "5 oz", "Sour Neon", CAT.candy, 1.0, 70, 4, "dg-ss-sour-worms"),
  // Jerky (existing)
  p("cccc0001-0000-4000-8000-00000000000d", "Jack Link's Original Beef Jerky", "Jack Link's", "Beef jerky", "3.25 oz", "Original", CAT.jerky, 5.49, 77, 2, "dg-jack-original"),
  p("cccc0001-0000-4000-8000-00000000000e", "Jack Link's Teriyaki Beef Jerky", "Jack Link's", "Teriyaki beef jerky", "3.25 oz", "Teriyaki", CAT.jerky, 5.49, 84, 2, "dg-jack-teriyaki"),
  p("cccc0001-0000-4000-8000-00000000000f", "Slim Jim", "Slim Jim", "Meat stick", "Giant", "Original", CAT.jerky, 1.65, 65, 5, "dg-slimjim"),
];

function sqlLiteral(v) {
  if (v == null) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
}

export function productsSql() {
  const rows = CATALOG.map((row) => {
    return `  (
    ${sqlLiteral(row.id)},
    ${sqlLiteral(row.name)}, ${sqlLiteral(row.brand)}, ${sqlLiteral(row.description)}, ${sqlLiteral(row.size)}, ${sqlLiteral(row.flavor)},
    ${sqlLiteral(row.category_id)}, ${sqlLiteral(row.store_id)},
    ${row.current_price}, ${row.min_price}, ${row.max_price}, ${row.popularity}, true, true, false, now(), ${sqlLiteral(row.external_product_id)}, ${row.max_quantity}
  )`;
  }).join(",\n");
  return `-- Products (${CATALOG.length} catalog items, Dollar General store)
insert into public.products (
  id, name, brand, description, size, flavor, category_id, store_id,
  current_price, min_price, max_price, popularity, available, active, archived,
  last_price_update, external_product_id, max_quantity
) values
${rows}
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
  max_quantity = excluded.max_quantity;`;
}

const isMain = process.argv[1]?.includes("upsert-catalog");
if (isMain) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.from("products").upsert(CATALOG, { onConflict: "id" });
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Upserted ${CATALOG.length} products`);
}
