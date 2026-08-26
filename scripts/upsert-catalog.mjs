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

/** Authoritative keep-list catalog */
export const CATALOG = [
  // —— Energy: Monster ——
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
  // —— Energy: Red Bull ——
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

  // —— Chips / crackers ——
  p("cccc0001-0000-4000-8000-000000000008", "Doritos Nacho Cheese", "Doritos", "Tortilla chips", "9.25 oz", "Nacho Cheese", CAT.chips, 3.15, 92, 3, "dg-doritos-nacho"),
  p("cccc0001-0000-4000-8000-000000000060", "Doritos Cool Ranch", "Doritos", "Tortilla chips", "9.25 oz", "Cool Ranch", CAT.chips, 3.15, 88, 3, "dg-doritos-cool-ranch"),
  p("cccc0001-0000-4000-8000-000000000061", "Doritos Sweet & Tangy BBQ", "Doritos", "Tortilla chips", "9.25 oz", "Sweet & Tangy BBQ", CAT.chips, 3.15, 80, 3, "dg-doritos-bbq"),
  p("cccc0001-0000-4000-8000-000000000062", "Doritos Flamin' Hot Nacho", "Doritos", "Flamin' Hot tortilla chips", "9.25 oz", "Flamin' Hot Nacho", CAT.chips, 3.15, 90, 3, "dg-doritos-fh-nacho"),
  p("cccc0001-0000-4000-8000-000000000063", "Cheetos Crunchy Cheese", "Cheetos", "Crunchy cheese snacks", "8.5 oz", "Crunchy Cheese", CAT.chips, 3.15, 86, 3, "dg-cheetos-crunchy"),
  p("cccc0001-0000-4000-8000-000000000064", "Cheetos Minis Cheddar Cheese", "Cheetos", "Mini cheddar cheese snacks", "1.25 oz", "Minis Cheddar", CAT.chips, 1.25, 78, 5, "dg-cheetos-minis"),
  p("cccc0001-0000-4000-8000-000000000065", "Cheetos Bold & Cheesy", "Cheetos", "Bold & cheesy snacks", "8 oz", "Bold & Cheesy", CAT.chips, 3.15, 77, 3, "dg-cheetos-bold"),
  p("cccc0001-0000-4000-8000-000000000066", "Cheetos Cheesy Jalapeño", "Cheetos", "Cheesy jalapeño snacks", "8 oz", "Cheesy Jalapeño", CAT.chips, 3.15, 81, 3, "dg-cheetos-jal"),
  p("cccc0001-0000-4000-8000-000000000009", "Cheetos Flamin' Hot", "Cheetos", "Flamin' Hot cheese snacks", "8.5 oz", "Flamin' Hot", CAT.chips, 3.15, 91, 3, "dg-cheetos-fh"),
  p("cccc0001-0000-4000-8000-000000000067", "Lay's Classic Potato Chips", "Lay's", "Classic potato chips", "8 oz", "Classic", CAT.chips, 3.25, 85, 3, "dg-lays-classic"),
  p("cccc0001-0000-4000-8000-000000000017", "Lay's Kettle Cooked Jalapeño", "Lay's", "Kettle cooked jalapeño chips", "8 oz", "Jalapeño", CAT.chips, 3.95, 83, 3, "dg-lays-kettle-jal"),
  p("cccc0001-0000-4000-8000-000000000068", "Ruffles Original", "Ruffles", "Ridged potato chips", "8.5 oz", "Original", CAT.chips, 3.25, 79, 3, "dg-ruffles-orig"),
  p("cccc0001-0000-4000-8000-000000000069", "Fritos Original", "Fritos", "Corn chips", "9.25 oz", "Original", CAT.chips, 3.15, 76, 3, "dg-fritos-orig"),
  p("cccc0001-0000-4000-8000-00000000006a", "Fritos Flavor Twists Queso", "Fritos", "Queso flavor twists", "9 oz", "Queso", CAT.chips, 3.15, 74, 3, "dg-fritos-queso"),
  p("cccc0001-0000-4000-8000-00000000001b", "Tostitos Scoops", "Tostitos", "Scoop tortilla chips", "10 oz", "Scoops", CAT.chips, 4.5, 82, 3, "dg-tostitos-scoops"),
  p("cccc0001-0000-4000-8000-00000000006b", "Tostitos Original Restaurant Style", "Tostitos", "Restaurant style tortilla chips", "13 oz", "Original Restaurant Style", CAT.chips, 4.5, 75, 3, "dg-tostitos-restaurant"),
  p("cccc0001-0000-4000-8000-00000000001a", "Pringles Original", "Pringles", "Stackable potato crisps", "2.3 oz", "Original", CAT.chips, 1.75, 84, 4, "dg-pringles-orig"),
  p("cccc0001-0000-4000-8000-00000000006c", "Pringles Sour Cream & Onion", "Pringles", "Stackable potato crisps", "2.3 oz", "Sour Cream & Onion", CAT.chips, 1.75, 83, 4, "dg-pringles-sco"),
  p("cccc0001-0000-4000-8000-000000000007", "Takis Fuego", "Takis", "Hot chili pepper & lime tortilla chips", "9.9 oz", "Fuego", CAT.chips, 4.15, 97, 3, "dg-takis-fuego"),
  p("cccc0001-0000-4000-8000-000000000016", "Munchies Cheese Fix", "Munchies", "Cheese snack mix", "8 oz", "Cheese Fix", CAT.chips, 3.65, 79, 3, "dg-munchies-cheese"),
  p("cccc0001-0000-4000-8000-00000000006d", "Goldfish Cheddar", "Goldfish", "Cheddar crackers", "6.6 oz", "Cheddar", CAT.chips, 2.95, 87, 3, "dg-goldfish-cheddar"),
  p("cccc0001-0000-4000-8000-000000000014", "Cheez-It Original", "Cheez-It", "Baked cheese crackers", "3 oz", "Original", CAT.chips, 1.25, 86, 4, "dg-cheezit-orig-3"),
  p("cccc0001-0000-4000-8000-000000000015", "Cheez-It White Cheddar", "Cheez-It", "White cheddar crackers", "7 oz", "White Cheddar", CAT.chips, 2.75, 82, 3, "dg-cheezit-white-7"),
  p("cccc0001-0000-4000-8000-000000000018", "Ritz Toasted Chips Sour Cream & Onion", "Ritz", "Toasted chips", "8.1 oz", "Sour Cream & Onion", CAT.chips, 4.35, 73, 3, "dg-ritz-sco"),

  // —— Cookies / bars ——
  p("cccc0001-0000-4000-8000-00000000001e", "OREO Minis Original", "OREO", "Mini sandwich cookies", "3.5 oz", "Original", CAT.snacks, 1.5, 91, 4, "dg-oreo-minis"),
  p("cccc0001-0000-4000-8000-00000000001d", "CHIPS AHOY! Minis Chocolate Chip", "CHIPS AHOY!", "Mini chocolate chip cookies", "3.5 oz", "Chocolate Chip", CAT.snacks, 1.5, 89, 4, "dg-chipsahoy-minis"),
  p("cccc0001-0000-4000-8000-00000000006e", "CHIPS AHOY! Original Chocolate Chip", "CHIPS AHOY!", "Chocolate chip cookies", "13 oz", "Original Chocolate Chip", CAT.snacks, 3.75, 85, 3, "dg-chipsahoy-orig"),
  p("cccc0001-0000-4000-8000-00000000001f", "CHIPS AHOY! Chunky Chocolatey Chip", "CHIPS AHOY!", "Chunky chocolate chip cookies", "11.75 oz", "Chunky", CAT.snacks, 4.0, 80, 3, "dg-chipsahoy-chunky"),
  p("cccc0001-0000-4000-8000-00000000006f", "CHIPS AHOY! Chewy Ice Cream Sandwich-Inspired", "CHIPS AHOY!", "Chewy ice cream sandwich-inspired cookies", "9.5 oz", "Chewy Ice Cream Sandwich", CAT.snacks, 3.75, 76, 3, "dg-chipsahoy-ice-cream"),
  p("cccc0001-0000-4000-8000-000000000024", "Nutter Butter Original Peanut Butter", "Nutter Butter", "Peanut butter sandwich cookies", "10.5 oz", "Original Peanut Butter", CAT.snacks, 5.0, 78, 2, "dg-nutter-butter"),
  p("cccc0001-0000-4000-8000-000000000025", "Keebler Fudge Stripes", "Keebler", "Fudge-striped shortbread cookies", "11.5 oz", "Fudge Stripes", CAT.snacks, 3.5, 81, 3, "dg-keebler-fudge-stripes"),
  p("cccc0001-0000-4000-8000-00000000001c", "Keebler Chips Deluxe with M&M's", "Keebler", "Cookies with M&M's", "9.75 oz", "M&M's", CAT.snacks, 3.5, 83, 3, "dg-keebler-deluxe-mm"),
  p("cccc0001-0000-4000-8000-000000000070", "Little Bites Chocolate Chip Muffins", "Little Bites", "Chocolate chip muffins", "8.25 oz", "Chocolate Chip", CAT.snacks, 3.95, 84, 3, "dg-little-bites-chip"),
  p("cccc0001-0000-4000-8000-000000000071", "Quaker Chewy Strawberry Yogurt", "Quaker Chewy", "Granola bar", "0.84 oz", "Strawberry Yogurt", CAT.snacks, 0.85, 72, 6, "dg-quaker-strawberry"),
  p("cccc0001-0000-4000-8000-000000000072", "Quaker Chewy Peanut Butter Chocolate Chip", "Quaker Chewy", "Granola bar", "0.84 oz", "Peanut Butter Chocolate Chip", CAT.snacks, 0.85, 74, 6, "dg-quaker-pb-chip"),
  p("cccc0001-0000-4000-8000-000000000073", "Nature Valley Crunchy Oats 'N Honey", "Nature Valley", "Crunchy granola bars", "1.5 oz", "Oats 'N Honey", CAT.snacks, 1.25, 77, 5, "dg-nature-valley-oats"),

  // —— Candy ——
  p("cccc0001-0000-4000-8000-00000000002e", "M&M'S Milk Chocolate", "M&M'S", "Milk chocolate candies", "2.55 oz", "Milk Chocolate", CAT.candy, 1.5, 88, 5, "dg-mms-milk"),
  p("cccc0001-0000-4000-8000-00000000002f", "M&M'S Peanut", "M&M'S", "Peanut chocolate candies", "2.55 oz", "Peanut", CAT.candy, 1.5, 89, 5, "dg-mms-peanut"),
  p("cccc0001-0000-4000-8000-000000000029", "REESE'S King Size Peanut Butter Cups", "Reese's", "King size peanut butter cups", "2.8 oz", "King Size", CAT.candy, 2.75, 93, 4, "dg-reeses-king"),
  p("cccc0001-0000-4000-8000-00000000002a", "REESE'S THiNS Peanut Butter Cups", "Reese's", "Thin peanut butter cups", "1.55 oz", "THiNS", CAT.candy, 1.5, 84, 5, "dg-reeses-thins"),
  p("cccc0001-0000-4000-8000-000000000028", "KIT KAT Milk Chocolate", "KIT KAT", "Chocolate wafer bar", "1.5 oz", "Milk Chocolate", CAT.candy, 1.75, 90, 5, "dg-kitkat"),
  p("cccc0001-0000-4000-8000-00000000002c", "SNICKERS Original", "SNICKERS", "Chocolate peanut nougat bar", "1.86 oz", "Original", CAT.candy, 1.75, 94, 5, "dg-snickers"),
  p("cccc0001-0000-4000-8000-00000000002d", "TWIX Caramel Cookie", "TWIX", "Caramel cookie candy bar", "1.79 oz", "Caramel", CAT.candy, 1.5, 87, 5, "dg-twix"),
  p("cccc0001-0000-4000-8000-000000000027", "LIFE SAVERS Gummies 5 Flavors", "LIFE SAVERS", "5 flavors gummy candy", "3.22 oz", "5 Flavors", CAT.candy, 1.5, 75, 4, "dg-lifesavers-gummy"),
  p("cccc0001-0000-4000-8000-000000000030", "Mike and Ike Tropical Typhoon", "Mike and Ike", "Chewy fruit candy", "0.78 oz", "Tropical Typhoon", CAT.candy, 0.25, 76, 10, "dg-mikeike-tropical"),
  p("cccc0001-0000-4000-8000-000000000031", "Mike and Ike Watermelon", "Mike and Ike", "Chewy watermelon candy", "0.78 oz", "Watermelon", CAT.candy, 0.25, 75, 10, "dg-mikeike-watermelon"),
  p("cccc0001-0000-4000-8000-000000000074", "Mike and Ike Mega Mix Sour", "Mike and Ike", "Sour chewy candy mix", "5 oz", "Mega Mix Sour", CAT.candy, 1.75, 73, 4, "dg-mikeike-mega-sour"),
  p("cccc0001-0000-4000-8000-00000000000b", "SOUR PATCH KIDS Original Assorted Fruit", "SOUR PATCH KIDS", "Sour then sweet candy", "3.56 oz", "Original Assorted Fruit", CAT.candy, 1.25, 86, 4, "dg-sourpatch"),
  p("cccc0001-0000-4000-8000-000000000034", "SOUR PATCH KIDS Peach", "SOUR PATCH KIDS", "Peach sour candy", "3.56 oz", "Peach", CAT.candy, 1.25, 85, 4, "dg-sourpatch-peach"),
  p("cccc0001-0000-4000-8000-000000000032", "SweeTarts Giant Chewy", "SweeTarts", "Giant chewy candy", "1.35 oz", "Giant Chewy", CAT.candy, 1.0, 74, 5, "dg-sweetarts-giant"),
  p("cccc0001-0000-4000-8000-000000000075", "SweeTarts Original", "SweeTarts", "Tangy candy", "5 oz", "Original", CAT.candy, 1.5, 72, 4, "dg-sweetarts-orig"),
  p("cccc0001-0000-4000-8000-000000000033", "Albanese Gummi Bears 12 Flavor", "Albanese", "12 flavor gummi bears", "3.5 oz", "12 Flavor", CAT.candy, 1.0, 77, 4, "dg-albanese-bears"),
  p("cccc0001-0000-4000-8000-000000000035", "Sweet Smiles Peach Gummi Rings", "Sweet Smiles", "Peach gummi rings", "5 oz", "Peach", CAT.candy, 1.0, 70, 4, "dg-ss-peach-rings"),
  p("cccc0001-0000-4000-8000-000000000036", "Sweet Smiles Sour Neon Gummi Worms", "Sweet Smiles", "Sour neon gummi worms", "5 oz", "Sour Neon", CAT.candy, 1.0, 71, 4, "dg-ss-sour-worms"),

  // —— Drinks ——
  p("cccc0001-0000-4000-8000-000000000005", "Coca-Cola Original", "Coca-Cola", "Classic cola", "20 oz", "Original", CAT.drinks, 1.75, 90, 4, "dg-coke-20"),
  p("cccc0001-0000-4000-8000-000000000076", "Coca-Cola Vanilla", "Coca-Cola", "Vanilla cola", "20 oz", "Vanilla", CAT.drinks, 1.85, 74, 4, "dg-coke-vanilla"),
  p("cccc0001-0000-4000-8000-000000000077", "Diet Coke", "Coca-Cola", "Diet cola", "20 oz", "Diet Coke", CAT.drinks, 1.75, 78, 4, "dg-diet-coke"),
  p("cccc0001-0000-4000-8000-000000000078", "Sprite Original Lemon-Lime", "Sprite", "Lemon-lime soda", "20 oz", "Original Lemon-Lime", CAT.drinks, 1.75, 84, 4, "dg-sprite"),
  p("cccc0001-0000-4000-8000-000000000004", "Dr Pepper Original", "Dr Pepper", "Soda", "20 oz", "Original", CAT.drinks, 1.75, 88, 4, "dg-drpepper-20"),
  p("cccc0001-0000-4000-8000-000000000079", "Dr Pepper Cherry", "Dr Pepper", "Cherry soda", "20 oz", "Cherry", CAT.drinks, 1.85, 80, 4, "dg-drpepper-cherry"),
  p("cccc0001-0000-4000-8000-00000000007a", "Dr Pepper Cream Soda", "Dr Pepper", "Cream soda", "20 oz", "Cream Soda", CAT.drinks, 1.85, 76, 4, "dg-drpepper-cream"),
  p("cccc0001-0000-4000-8000-00000000007b", "Diet Dr Pepper", "Dr Pepper", "Diet soda", "20 oz", "Diet", CAT.drinks, 1.75, 73, 4, "dg-diet-drpepper"),
  p("cccc0001-0000-4000-8000-000000000011", "Pepsi Original", "Pepsi", "Cola", "20 oz", "Original", CAT.drinks, 1.75, 82, 4, "dg-pepsi-20"),
  p("cccc0001-0000-4000-8000-00000000007c", "Diet Pepsi", "Pepsi", "Diet cola", "20 oz", "Diet Pepsi", CAT.drinks, 1.75, 72, 4, "dg-diet-pepsi"),
  p("cccc0001-0000-4000-8000-00000000007d", "Pepsi Wild Cherry", "Pepsi", "Wild cherry cola", "20 oz", "Wild Cherry", CAT.drinks, 1.85, 75, 4, "dg-pepsi-wild-cherry"),
  p("cccc0001-0000-4000-8000-000000000010", "Mountain Dew Original", "Mountain Dew", "Citrus soda", "20 oz", "Original", CAT.drinks, 1.75, 86, 4, "dg-mtn-dew-20"),
  p("cccc0001-0000-4000-8000-00000000007e", "Mountain Dew Code Red", "Mountain Dew", "Cherry citrus soda", "20 oz", "Code Red", CAT.drinks, 1.85, 81, 4, "dg-mtn-dew-code-red"),
  p("cccc0001-0000-4000-8000-00000000007f", "Mountain Dew Diet", "Mountain Dew", "Diet citrus soda", "20 oz", "Diet", CAT.drinks, 1.75, 68, 4, "dg-mtn-dew-diet"),
  p("cccc0001-0000-4000-8000-000000000080", "Mountain Dew Zero Sugar", "Mountain Dew", "Zero sugar citrus soda", "20 oz", "Zero Sugar", CAT.drinks, 1.75, 74, 4, "dg-mtn-dew-zero"),
  p("cccc0001-0000-4000-8000-000000000081", "7UP Lemon-Lime", "7UP", "Lemon-lime soda", "20 oz", "Lemon-Lime", CAT.drinks, 1.75, 70, 4, "dg-7up"),
  p("cccc0001-0000-4000-8000-000000000012", "7UP Zero Sugar", "7UP", "Zero sugar lemon-lime soda", "20 oz", "Zero Sugar", CAT.drinks, 1.75, 69, 4, "dg-7up-zero-20"),
  p("cccc0001-0000-4000-8000-000000000013", "Mug Root Beer", "Mug", "Root beer", "20 oz", "Original", CAT.drinks, 1.75, 71, 4, "dg-mug-20"),
  p("cccc0001-0000-4000-8000-000000000082", "Starry Lemon-Lime", "Starry", "Lemon-lime soda", "20 oz", "Lemon-Lime", CAT.drinks, 1.75, 73, 4, "dg-starry"),
  p("cccc0001-0000-4000-8000-000000000006", "Gatorade Frost Glacier Cherry", "Gatorade", "Sports drink", "20 oz", "Frost Glacier Cherry", CAT.drinks, 1.85, 85, 4, "dg-gatorade-glacier-cherry"),
  p("cccc0001-0000-4000-8000-000000000083", "Gatorade Orange", "Gatorade", "Sports drink", "20 oz", "Orange", CAT.drinks, 1.85, 83, 4, "dg-gatorade-orange"),
  p("cccc0001-0000-4000-8000-000000000084", "Gatorade Cool Blue", "Gatorade", "Sports drink", "20 oz", "Cool Blue", CAT.drinks, 1.85, 84, 4, "dg-gatorade-cool-blue"),
  p("cccc0001-0000-4000-8000-000000000085", "Propel Kiwi Strawberry Zero Sugar", "Propel", "Zero sugar fitness water", "20 oz", "Kiwi Strawberry", CAT.drinks, 1.65, 70, 4, "dg-propel-kiwi-strawberry"),
  p("cccc0001-0000-4000-8000-000000000086", "Capri Sun Fruit Punch", "Capri Sun", "Juice pouch", "6 oz", "Fruit Punch", CAT.drinks, 0.75, 80, 6, "dg-caprisun-fruit-punch"),
  p("cccc0001-0000-4000-8000-000000000087", "Capri Sun Pacific Cooler", "Capri Sun", "Juice pouch", "6 oz", "Pacific Cooler", CAT.drinks, 0.75, 78, 6, "dg-caprisun-pacific"),
  p("cccc0001-0000-4000-8000-000000000088", "Capri Sun Wild Cherry", "Capri Sun", "Juice pouch", "6 oz", "Wild Cherry", CAT.drinks, 0.75, 77, 6, "dg-caprisun-wild-cherry"),
  p("cccc0001-0000-4000-8000-000000000089", "Capri Sun Lemonade", "Capri Sun", "Juice pouch", "6 oz", "Lemonade", CAT.drinks, 0.75, 76, 6, "dg-caprisun-lemonade"),
  p("cccc0001-0000-4000-8000-00000000008a", "Kool-Aid Bursts Berry Blue", "Kool-Aid Bursts", "Juice drink", "6.75 oz", "Berry Blue", CAT.drinks, 0.85, 79, 6, "dg-koolaid-bursts-blue"),
  p("cccc0001-0000-4000-8000-00000000008b", "Kool-Aid Jammers Tropical Punch", "Kool-Aid Jammers", "Juice drink", "6 oz", "Tropical Punch", CAT.drinks, 0.85, 78, 6, "dg-koolaid-jammers-tropical"),
  p("cccc0001-0000-4000-8000-00000000008c", "Mott's Original Apple Juice", "Mott's", "Apple juice", "6.75 oz", "Original Apple", CAT.drinks, 1.25, 74, 4, "dg-motts-apple"),
  p("cccc0001-0000-4000-8000-00000000008d", "Bubly Lime", "Bubly", "Sparkling water", "12 oz", "Lime", CAT.drinks, 1.25, 72, 4, "dg-bubly-lime"),

  // —— Jerky ——
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

const CAT_DEMO = {
  [CAT.drinks]: "cat-drinks",
  [CAT.energy]: "cat-energy",
  [CAT.chips]: "cat-chips",
  [CAT.candy]: "cat-candy",
  [CAT.jerky]: "cat-jerky",
  [CAT.snacks]: "cat-snacks",
};

export function demoProductsTs() {
  const lines = CATALOG.map((row) => {
    const id = `p-${row.external_product_id.replace(/^dg-/, "")}`;
    const cat = CAT_DEMO[row.category_id];
    return `  snack({ id: ${JSON.stringify(id)}, name: ${JSON.stringify(row.name)}, brand: ${JSON.stringify(row.brand)}, description: ${JSON.stringify(row.description)}, size: ${JSON.stringify(row.size)}, flavor: ${JSON.stringify(row.flavor)}, category_id: ${JSON.stringify(cat)}, price: ${row.current_price}, popularity: ${row.popularity}, max_quantity: ${row.max_quantity}, external: ${JSON.stringify(row.external_product_id)} }),`;
  });
  return `export const DEMO_PRODUCTS: Product[] = [\n${lines.join("\n")}\n];\n`;
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

  // Hide anything not on the keep-list
  const keepIds = CATALOG.map((r) => r.id);
  const { data: all, error: listErr } = await db.from("products").select("id");
  if (listErr) {
    console.error(listErr);
    process.exit(1);
  }
  const drop = (all ?? []).map((r) => r.id).filter((id) => !keepIds.includes(id));
  if (drop.length) {
    const { error: archErr } = await db
      .from("products")
      .update({ active: false, archived: true, available: false })
      .in("id", drop);
    if (archErr) {
      console.error(archErr);
      process.exit(1);
    }
  }

  console.log(`Upserted ${CATALOG.length} products; archived ${drop.length} extras`);
}
