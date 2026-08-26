import type {
  AppSettings,
  Category,
  LunchRunSession,
  Order,
  OrderItem,
  PendingProductMatch,
  PriceHistoryEntry,
  PriceImportLog,
  Product,
  Store,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

const now = new Date();
const today = now.toISOString().slice(0, 10);
const thisMorning = new Date(now);
thisMorning.setHours(8, 4, 0, 0);

export const DEMO_STORES: Store[] = [
  {
    id: "store-dg",
    name: "Dollar General",
    address: "Near campus",
    active: true,
    is_default: true,
    price_source: "Dollar General Online",
    external_location_id: "DG-LOCAL",
    hours: "8:00 AM – 10:00 PM",
  },
  {
    id: "store-sng",
    name: "Stop-N-Go",
    address: "Main Street",
    active: true,
    is_default: false,
    price_source: "Manual",
    external_location_id: null,
    hours: "6:00 AM – 11:00 PM",
  },
];

export const DEMO_CATEGORIES: Category[] = [
  { id: "cat-drinks", name: "Drinks", slug: "drinks", icon: "CupSoda", sort_order: 1, shopping_order: 1, active: true },
  { id: "cat-energy", name: "Energy Drinks", slug: "energy-drinks", icon: "Zap", sort_order: 2, shopping_order: 2, active: true },
  { id: "cat-chips", name: "Chips", slug: "chips", icon: "Cookie", sort_order: 3, shopping_order: 3, active: true },
  { id: "cat-candy", name: "Candy", slug: "candy", icon: "Candy", sort_order: 4, shopping_order: 4, active: true },
  { id: "cat-jerky", name: "Jerky", slug: "jerky", icon: "Beef", sort_order: 5, shopping_order: 5, active: true },
  { id: "cat-snacks", name: "Snacks", slug: "snacks", icon: "Popcorn", sort_order: 6, shopping_order: 6, active: true },
  { id: "cat-gum", name: "Gum", slug: "gum", icon: "CircleDot", sort_order: 7, shopping_order: 7, active: true },
  { id: "cat-other", name: "Other", slug: "other", icon: "Package", sort_order: 8, shopping_order: 8, active: true },
];

function product(
  partial: Omit<Product, "created_at" | "updated_at" | "archived" | "active"> &
    Partial<Pick<Product, "archived" | "active">>,
): Product {
  return {
    active: true,
    archived: false,
    created_at: thisMorning.toISOString(),
    updated_at: thisMorning.toISOString(),
    ...partial,
  };
}

function priceBand(price: number) {
  return {
    min_price: Math.round(price * 0.85 * 100) / 100,
    max_price: Math.round(price * 1.25 * 100) / 100,
  };
}

function snack(opts: {
  id: string;
  name: string;
  brand: string;
  description: string;
  size: string;
  flavor: string;
  category_id: string;
  price: number;
  popularity: number;
  max_quantity: number;
  external: string;
}): Product {
  const { min_price, max_price } = priceBand(opts.price);
  return product({
    id: opts.id,
    name: opts.name,
    brand: opts.brand,
    description: opts.description,
    size: opts.size,
    flavor: opts.flavor,
    category_id: opts.category_id,
    image_url: null,
    store_id: "store-dg",
    current_price: opts.price,
    min_price,
    max_price,
    popularity: opts.popularity,
    available: true,
    last_price_update: thisMorning.toISOString(),
    external_product_url: null,
    external_product_id: opts.external,
    max_quantity: opts.max_quantity,
  });
}

export const DEMO_PRODUCTS: Product[] = [
  // Monster — 16 oz cans
  snack({ id: "p-monster-orig", name: "Monster Energy Original", brand: "Monster", description: "Classic green Monster", size: "16 oz", flavor: "Original", category_id: "cat-energy", price: 2.85, popularity: 96, max_quantity: 4, external: "dg-monster-original" }),
  snack({ id: "p-monster-ultra", name: "Monster Zero Ultra", brand: "Monster", description: "Zero sugar, light citrus", size: "16 oz", flavor: "Zero Ultra", category_id: "cat-energy", price: 2.85, popularity: 98, max_quantity: 4, external: "dg-monster-zero-ultra" }),
  snack({ id: "p-monster-rosa", name: "Monster Ultra Rosá", brand: "Monster", description: "Zero sugar, fruity floral", size: "16 oz", flavor: "Ultra Rosá", category_id: "cat-energy", price: 2.85, popularity: 88, max_quantity: 4, external: "dg-monster-ultra-rosa" }),
  snack({ id: "p-monster-paradise", name: "Monster Ultra Paradise", brand: "Monster", description: "Zero sugar, island fruit", size: "16 oz", flavor: "Ultra Paradise", category_id: "cat-energy", price: 2.85, popularity: 87, max_quantity: 4, external: "dg-monster-ultra-paradise" }),
  snack({ id: "p-monster-rwb", name: "Monster Ultra Red White & Blue Razz", brand: "Monster", description: "Zero sugar, blue raspberry rocket-pop", size: "16 oz", flavor: "Red White & Blue Razz", category_id: "cat-energy", price: 2.85, popularity: 86, max_quantity: 4, external: "dg-monster-ultra-rwb" }),
  snack({ id: "p-monster-mango", name: "Juice Monster Mango Loco", brand: "Monster", description: "Tropical mango energy drink", size: "16 oz", flavor: "Mango Loco", category_id: "cat-energy", price: 2.95, popularity: 84, max_quantity: 4, external: "dg-monster-mango-loco" }),
  snack({ id: "p-monster-punch", name: "Juice Monster Pacific Punch", brand: "Monster", description: "Fruit punch energy drink", size: "16 oz", flavor: "Pacific Punch", category_id: "cat-energy", price: 2.95, popularity: 83, max_quantity: 4, external: "dg-monster-pacific-punch" }),
  snack({ id: "p-java-mean", name: "Java Monster Mean Bean", brand: "Monster", description: "Coffee and cream energy drink", size: "15 oz", flavor: "Mean Bean", category_id: "cat-energy", price: 3.15, popularity: 80, max_quantity: 4, external: "dg-java-mean-bean" }),
  snack({ id: "p-java-moca", name: "Java Monster Loca Moca", brand: "Monster", description: "Coffee mocha energy drink", size: "15 oz", flavor: "Loca Moca", category_id: "cat-energy", price: 3.15, popularity: 79, max_quantity: 4, external: "dg-java-loca-moca" }),
  snack({ id: "p-java-irish", name: "Java Monster Irish Crème", brand: "Monster", description: "Coffee Irish crème energy drink", size: "15 oz", flavor: "Irish Crème", category_id: "cat-energy", price: 3.15, popularity: 78, max_quantity: 4, external: "dg-java-irish-creme" }),
  // Red Bull — 8.4 oz cans
  snack({ id: "p-redbull", name: "Red Bull Original", brand: "Red Bull", description: "Classic energy drink", size: "8.4 oz", flavor: "Original", category_id: "cat-energy", price: 2.75, popularity: 95, max_quantity: 4, external: "dg-redbull" }),
  snack({ id: "p-redbull-sf", name: "Red Bull Sugarfree", brand: "Red Bull", description: "Sugar-free energy drink", size: "8.4 oz", flavor: "Sugarfree", category_id: "cat-energy", price: 2.75, popularity: 90, max_quantity: 4, external: "dg-redbull-sugarfree" }),
  snack({ id: "p-redbull-zero", name: "Red Bull Zero", brand: "Red Bull", description: "Zero calorie energy drink", size: "8.4 oz", flavor: "Zero", category_id: "cat-energy", price: 2.75, popularity: 89, max_quantity: 4, external: "dg-redbull-zero" }),
  snack({ id: "p-redbull-pear", name: "Red Bull Winter Edition Pear Cinnamon", brand: "Red Bull", description: "Pear cinnamon winter edition", size: "8.4 oz", flavor: "Pear Cinnamon", category_id: "cat-energy", price: 2.95, popularity: 72, max_quantity: 4, external: "dg-redbull-pear-cinnamon" }),
  snack({ id: "p-redbull-dragon", name: "Red Bull Green Edition Dragon Fruit", brand: "Red Bull", description: "Dragon fruit edition", size: "8.4 oz", flavor: "Dragon Fruit", category_id: "cat-energy", price: 2.95, popularity: 82, max_quantity: 4, external: "dg-redbull-dragon-fruit" }),
  snack({ id: "p-redbull-june", name: "Red Bull Sea Blue Edition Juneberry", brand: "Red Bull", description: "Juneberry sea blue edition", size: "8.4 oz", flavor: "Juneberry", category_id: "cat-energy", price: 2.95, popularity: 81, max_quantity: 4, external: "dg-redbull-juneberry" }),
  snack({ id: "p-redbull-tropical", name: "Red Bull Yellow Edition Tropical", brand: "Red Bull", description: "Tropical yellow edition", size: "8.4 oz", flavor: "Tropical", category_id: "cat-energy", price: 2.95, popularity: 83, max_quantity: 4, external: "dg-redbull-tropical" }),
  snack({ id: "p-redbull-blue", name: "Red Bull Blue Edition Blueberry", brand: "Red Bull", description: "Blueberry edition", size: "8.4 oz", flavor: "Blueberry", category_id: "cat-energy", price: 2.95, popularity: 84, max_quantity: 4, external: "dg-redbull-blueberry" }),
  snack({ id: "p-redbull-coconut", name: "Red Bull Coconut Edition Coconut Berry", brand: "Red Bull", description: "Coconut berry edition", size: "8.4 oz", flavor: "Coconut Berry", category_id: "cat-energy", price: 2.95, popularity: 80, max_quantity: 4, external: "dg-redbull-coconut-berry" }),
  snack({ id: "p-redbull-melon", name: "Red Bull Red Edition Watermelon", brand: "Red Bull", description: "Watermelon edition", size: "8.4 oz", flavor: "Watermelon", category_id: "cat-energy", price: 2.95, popularity: 85, max_quantity: 4, external: "dg-redbull-watermelon" }),
  snack({ id: "p-redbull-peach", name: "Red Bull Peach Edition Peach Nectarine", brand: "Red Bull", description: "Peach nectarine edition", size: "8.4 oz", flavor: "Peach Nectarine", category_id: "cat-energy", price: 2.95, popularity: 82, max_quantity: 4, external: "dg-redbull-peach-nectarine" }),
  snack({ id: "p-redbull-white-peach", name: "Red Bull White Peach", brand: "Red Bull", description: "White peach energy drink", size: "8.4 oz", flavor: "White Peach", category_id: "cat-energy", price: 2.95, popularity: 81, max_quantity: 4, external: "dg-redbull-white-peach" }),
  snack({ id: "p-redbull-vanilla", name: "Red Bull Iced Vanilla Berry", brand: "Red Bull", description: "Iced vanilla berry", size: "8.4 oz", flavor: "Iced Vanilla Berry", category_id: "cat-energy", price: 2.95, popularity: 79, max_quantity: 4, external: "dg-redbull-iced-vanilla-berry" }),
  snack({ id: "p-redbull-strawberry", name: "Red Bull Strawberry Apricot", brand: "Red Bull", description: "Strawberry apricot", size: "8.4 oz", flavor: "Strawberry Apricot", category_id: "cat-energy", price: 2.95, popularity: 78, max_quantity: 4, external: "dg-redbull-strawberry-apricot" }),
  snack({ id: "p-redbull-wild", name: "Red Bull Wild Berries", brand: "Red Bull", description: "Wild berries", size: "8.4 oz", flavor: "Wild Berries", category_id: "cat-energy", price: 2.95, popularity: 80, max_quantity: 4, external: "dg-redbull-wild-berries" }),
  // Drinks
  snack({ id: "p-drpepper", name: "Dr Pepper", brand: "Dr Pepper", description: "Soda", size: "20 oz", flavor: "Original", category_id: "cat-drinks", price: 1.75, popularity: 80, max_quantity: 4, external: "dg-drpepper-20" }),
  snack({ id: "p-coke", name: "Coca-Cola", brand: "Coca-Cola", description: "Classic cola", size: "20 oz", flavor: "Original", category_id: "cat-drinks", price: 1.75, popularity: 78, max_quantity: 4, external: "dg-coke-20" }),
  snack({ id: "p-gatorade", name: "Gatorade", brand: "Gatorade", description: "Sports drink", size: "20 oz", flavor: "Fruit Punch", category_id: "cat-drinks", price: 1.85, popularity: 70, max_quantity: 4, external: "dg-gatorade" }),
  snack({ id: "p-mtn-dew", name: "Mountain Dew", brand: "Mountain Dew", description: "Citrus soda", size: "20 fl oz", flavor: "Original", category_id: "cat-drinks", price: 2.6, popularity: 76, max_quantity: 4, external: "dg-mtn-dew-20" }),
  snack({ id: "p-pepsi", name: "Pepsi", brand: "Pepsi", description: "Cola", size: "20 fl oz", flavor: "Original", category_id: "cat-drinks", price: 2.6, popularity: 74, max_quantity: 4, external: "dg-pepsi-20" }),
  snack({ id: "p-7up", name: "7UP Zero Sugar", brand: "7UP", description: "Lemon-lime soda", size: "20 fl oz", flavor: "Zero Sugar", category_id: "cat-drinks", price: 2.5, popularity: 60, max_quantity: 4, external: "dg-7up-zero-20" }),
  snack({ id: "p-mug", name: "Mug Root Beer", brand: "Mug", description: "Root beer", size: "20 fl oz", flavor: "Original", category_id: "cat-drinks", price: 2.25, popularity: 62, max_quantity: 4, external: "dg-mug-20" }),
  // Chips
  snack({ id: "p-takis", name: "Takis Fuego", brand: "Takis", description: "Hot chili pepper tortilla chips", size: "9.9 oz", flavor: "Fuego", category_id: "cat-chips", price: 4.15, popularity: 95, max_quantity: 3, external: "dg-takis-fuego" }),
  snack({ id: "p-doritos", name: "Doritos Nacho Cheese", brand: "Doritos", description: "Tortilla chips", size: "9.25 oz", flavor: "Nacho Cheese", category_id: "cat-chips", price: 3.15, popularity: 75, max_quantity: 3, external: "dg-doritos-nacho" }),
  snack({ id: "p-cheetos", name: "Cheetos Flamin' Hot", brand: "Cheetos", description: "Flamin' Hot cheese snacks", size: "8.5 oz", flavor: "Flamin' Hot", category_id: "cat-chips", price: 3.15, popularity: 88, max_quantity: 3, external: "dg-cheetos-fh" }),
  snack({ id: "p-cheezit-orig", name: "Cheez-It Original Cheese Crackers", brand: "Cheez-It", description: "Baked cheese crackers", size: "3 oz", flavor: "Original", category_id: "cat-chips", price: 1.25, popularity: 86, max_quantity: 4, external: "dg-cheezit-orig-3" }),
  snack({ id: "p-cheezit-white", name: "Cheez-It White Cheddar Crackers", brand: "Cheez-It", description: "White cheddar crackers", size: "7 oz", flavor: "White Cheddar", category_id: "cat-chips", price: 2.75, popularity: 82, max_quantity: 3, external: "dg-cheezit-white-7" }),
  snack({ id: "p-munchies", name: "Munchies Cheese Fix Snack Mix", brand: "Munchies", description: "Cheese snack mix", size: "8 oz", flavor: "Cheese Fix", category_id: "cat-chips", price: 3.65, popularity: 79, max_quantity: 3, external: "dg-munchies-cheese" }),
  snack({ id: "p-lays-jal", name: "Lay's Kettle Cooked Jalapeño Potato Chips", brand: "Lay's", description: "Kettle cooked jalapeño chips", size: "8 oz", flavor: "Jalapeño", category_id: "cat-chips", price: 3.95, popularity: 81, max_quantity: 3, external: "dg-lays-kettle-jal" }),
  snack({ id: "p-ritz-sco", name: "Ritz Sour Cream and Onion Toasted Chips", brand: "Ritz", description: "Toasted chips", size: "8.1 oz", flavor: "Sour Cream and Onion", category_id: "cat-chips", price: 4.35, popularity: 73, max_quantity: 3, external: "dg-ritz-sco" }),
  snack({ id: "p-chicken-biskit", name: "Chicken in a Biskit Original Crackers", brand: "Chicken in a Biskit", description: "Chicken-flavored crackers", size: "7.5 oz", flavor: "Original", category_id: "cat-chips", price: 4.25, popularity: 71, max_quantity: 3, external: "dg-chicken-biskit" }),
  snack({ id: "p-pringles", name: "Pringles Original Potato Crisps", brand: "Pringles", description: "Stackable potato crisps", size: "2.3 oz", flavor: "Original", category_id: "cat-chips", price: 1.75, popularity: 84, max_quantity: 4, external: "dg-pringles-orig" }),
  snack({ id: "p-tostitos", name: "Tostitos Scoops Tortilla Chips", brand: "Tostitos", description: "Scoop tortilla chips", size: "10 oz", flavor: "Original", category_id: "cat-chips", price: 4.5, popularity: 77, max_quantity: 3, external: "dg-tostitos-scoops" }),
  // Cookies / snacks
  snack({ id: "p-keebler-deluxe", name: "Keebler Chips Deluxe Cookies with M&M's", brand: "Keebler", description: "Cookies with M&M's", size: "9.75 oz", flavor: "M&M's", category_id: "cat-snacks", price: 3.5, popularity: 78, max_quantity: 3, external: "dg-keebler-deluxe-mm" }),
  snack({ id: "p-chipsahoy-minis", name: "CHIPS AHOY! Minis Go-Paks", brand: "CHIPS AHOY!", description: "Mini chocolate chip cookies", size: "3.5 oz", flavor: "Chocolate Chip", category_id: "cat-snacks", price: 1.5, popularity: 89, max_quantity: 4, external: "dg-chipsahoy-minis" }),
  snack({ id: "p-oreo-minis", name: "OREO Minis Go-Paks", brand: "OREO", description: "Mini sandwich cookies", size: "3.5 oz", flavor: "Original", category_id: "cat-snacks", price: 1.5, popularity: 91, max_quantity: 4, external: "dg-oreo-minis" }),
  snack({ id: "p-chipsahoy-chunky", name: "CHIPS AHOY! Chunky Cookies", brand: "CHIPS AHOY!", description: "Chunky chocolate chip cookies", size: "11.75 oz", flavor: "Chunky", category_id: "cat-snacks", price: 4.0, popularity: 74, max_quantity: 3, external: "dg-chipsahoy-chunky" }),
  snack({ id: "p-cv-wafers", name: "Clover Valley Strawberry Sugar Wafers", brand: "Clover Valley", description: "Strawberry sugar wafers", size: "8 oz", flavor: "Strawberry", category_id: "cat-snacks", price: 1.65, popularity: 66, max_quantity: 4, external: "dg-cv-strawberry-wafers" }),
  snack({ id: "p-cv-chewy", name: "Clover Valley Chewy Chocolate Chip Cookies", brand: "Clover Valley", description: "Chewy chocolate chip cookies", size: "12 oz", flavor: "Chocolate Chip", category_id: "cat-snacks", price: 2.75, popularity: 70, max_quantity: 3, external: "dg-cv-chewy-chip" }),
  snack({ id: "p-cv-duplex", name: "Clover Valley Duplex Sandwich Creme Cookies", brand: "Clover Valley", description: "Duplex creme cookies", size: "11.8 oz", flavor: "Duplex", category_id: "cat-snacks", price: 1.5, popularity: 68, max_quantity: 3, external: "dg-cv-duplex" }),
  snack({ id: "p-nilla", name: "NILLA Wafers", brand: "NILLA", description: "Vanilla wafer cookies", size: "11 oz", flavor: "Original", category_id: "cat-snacks", price: 4.95, popularity: 64, max_quantity: 2, external: "dg-nilla-wafers" }),
  snack({ id: "p-nutter", name: "Nutter Butter Peanut Butter Wafer Cookies", brand: "Nutter Butter", description: "Peanut butter wafer cookies", size: "10.5 oz", flavor: "Peanut Butter", category_id: "cat-snacks", price: 5.0, popularity: 72, max_quantity: 2, external: "dg-nutter-butter" }),
  snack({ id: "p-fudge-stripes", name: "Keebler Fudge Stripes Cookies", brand: "Keebler", description: "Fudge-striped shortbread cookies", size: "11.5 oz", flavor: "Fudge Stripes", category_id: "cat-snacks", price: 3.5, popularity: 76, max_quantity: 3, external: "dg-keebler-fudge-stripes" }),
  // Candy
  snack({ id: "p-reeses", name: "Reese's Peanut Butter Cups", brand: "Reese's", description: "Chocolate peanut butter cups", size: "1.5 oz", flavor: "Milk Chocolate", category_id: "cat-candy", price: 1.45, popularity: 82, max_quantity: 5, external: "dg-reeses" }),
  snack({ id: "p-sourpatch", name: "Sour Patch Kids", brand: "Sour Patch", description: "Sour then sweet candy", size: "8 oz", flavor: "Original", category_id: "cat-candy", price: 2.95, popularity: 72, max_quantity: 3, external: "dg-sourpatch" }),
  snack({ id: "p-skittles", name: "Skittles", brand: "Skittles", description: "Fruit candy", size: "7 oz", flavor: "Original", category_id: "cat-candy", price: 2.85, popularity: 68, max_quantity: 3, external: "dg-skittles" }),
  snack({ id: "p-blow-pop", name: "Super Blow Pops Lollipops", brand: "Blow Pops", description: "Gum-filled lollipop", size: "1 lollipop", flavor: "Assorted", category_id: "cat-candy", price: 0.5, popularity: 87, max_quantity: 8, external: "dg-blow-pop" }),
  snack({ id: "p-lifesavers", name: "LIFE SAVERS 5 Flavors Gummy Candy", brand: "LIFE SAVERS", description: "5 flavors gummy candy", size: "3.22 oz", flavor: "5 Flavors", category_id: "cat-candy", price: 1.5, popularity: 69, max_quantity: 4, external: "dg-lifesavers-gummy" }),
  snack({ id: "p-kitkat", name: "KIT KAT Milk Chocolate Wafer Bar", brand: "KIT KAT", description: "Chocolate wafer bar", size: "1.5 oz", flavor: "Milk Chocolate", category_id: "cat-candy", price: 1.75, popularity: 88, max_quantity: 5, external: "dg-kitkat" }),
  snack({ id: "p-reeses-king", name: "REESE'S King Size Peanut Butter Cups", brand: "Reese's", description: "King size peanut butter cups", size: "2.8 oz", flavor: "Milk Chocolate", category_id: "cat-candy", price: 2.75, popularity: 90, max_quantity: 4, external: "dg-reeses-king" }),
  snack({ id: "p-reeses-thins", name: "REESE'S THiNS Milk Chocolate Peanut Butter Cups", brand: "Reese's", description: "Thin peanut butter cups", size: "1.55 oz", flavor: "THiNS", category_id: "cat-candy", price: 1.5, popularity: 80, max_quantity: 5, external: "dg-reeses-thins" }),
  snack({ id: "p-lindor", name: "Lindt Lindor Milk Chocolate Truffle", brand: "Lindt", description: "Milk chocolate truffle", size: "1 piece", flavor: "Milk Chocolate", category_id: "cat-candy", price: 0.85, popularity: 83, max_quantity: 6, external: "dg-lindor" }),
  snack({ id: "p-snickers", name: "SNICKERS Original Share Size", brand: "SNICKERS", description: "Chocolate peanut nougat bar", size: "3.29 oz", flavor: "Original", category_id: "cat-candy", price: 2.65, popularity: 92, max_quantity: 4, external: "dg-snickers-share" }),
  snack({ id: "p-twix", name: "TWIX Caramel Cookie Candy Bar", brand: "TWIX", description: "Caramel cookie candy bar", size: "1.79 oz", flavor: "Caramel", category_id: "cat-candy", price: 1.5, popularity: 85, max_quantity: 5, external: "dg-twix" }),
  snack({ id: "p-mms-milk", name: "M&M'S Milk Chocolate Peg Bag", brand: "M&M'S", description: "Milk chocolate candies", size: "2.55 oz", flavor: "Milk Chocolate", category_id: "cat-candy", price: 1.5, popularity: 86, max_quantity: 5, external: "dg-mms-milk" }),
  snack({ id: "p-mms-peanut", name: "M&M'S Peanut Milk Chocolate Bag", brand: "M&M'S", description: "Peanut chocolate candies", size: "2.55 oz", flavor: "Peanut", category_id: "cat-candy", price: 1.5, popularity: 87, max_quantity: 5, external: "dg-mms-peanut" }),
  snack({ id: "p-mikeike-trop", name: "Mike and Ike Tropical Typhoon", brand: "Mike and Ike", description: "Chewy fruit candy", size: "0.78 oz", flavor: "Tropical Typhoon", category_id: "cat-candy", price: 0.25, popularity: 75, max_quantity: 10, external: "dg-mikeike-tropical" }),
  snack({ id: "p-mikeike-wm", name: "Mike and Ike Watermelon Chewy Candy", brand: "Mike and Ike", description: "Chewy watermelon candy", size: "0.78 oz", flavor: "Watermelon", category_id: "cat-candy", price: 0.25, popularity: 74, max_quantity: 10, external: "dg-mikeike-watermelon" }),
  snack({ id: "p-sweetarts", name: "SweeTarts Giant Chewy Candy", brand: "SweeTarts", description: "Giant chewy candy", size: "1.35 oz", flavor: "Original", category_id: "cat-candy", price: 1.0, popularity: 71, max_quantity: 5, external: "dg-sweetarts-giant" }),
  snack({ id: "p-albanese", name: "Albanese 12 Flavor Gummi Bears", brand: "Albanese", description: "12 flavor gummi bears", size: "3.5 oz", flavor: "12 Flavor", category_id: "cat-candy", price: 1.0, popularity: 73, max_quantity: 4, external: "dg-albanese-bears" }),
  snack({ id: "p-sourpatch-peach", name: "SOUR PATCH KIDS Peach Candy", brand: "SOUR PATCH KIDS", description: "Peach sour candy", size: "3.56 oz", flavor: "Peach", category_id: "cat-candy", price: 1.0, popularity: 81, max_quantity: 4, external: "dg-sourpatch-peach" }),
  snack({ id: "p-ss-peach", name: "Sweet Smiles Peach Gummi Rings", brand: "Sweet Smiles", description: "Peach gummi rings", size: "5 oz", flavor: "Peach", category_id: "cat-candy", price: 1.0, popularity: 67, max_quantity: 4, external: "dg-ss-peach-rings" }),
  snack({ id: "p-ss-worms", name: "Sweet Smiles Sour Neon Gummi Worms", brand: "Sweet Smiles", description: "Sour neon gummi worms", size: "5 oz", flavor: "Sour Neon", category_id: "cat-candy", price: 1.0, popularity: 70, max_quantity: 4, external: "dg-ss-sour-worms" }),
  // Jerky
  snack({ id: "p-jack-orig", name: "Jack Link's Original Beef Jerky", brand: "Jack Link's", description: "Beef jerky", size: "3.25 oz", flavor: "Original", category_id: "cat-jerky", price: 5.49, popularity: 77, max_quantity: 2, external: "dg-jack-original" }),
  snack({ id: "p-jack-teri", name: "Jack Link's Teriyaki Beef Jerky", brand: "Jack Link's", description: "Teriyaki beef jerky", size: "3.25 oz", flavor: "Teriyaki", category_id: "cat-jerky", price: 5.49, popularity: 84, max_quantity: 2, external: "dg-jack-teriyaki" }),
  snack({ id: "p-slimjim", name: "Slim Jim", brand: "Slim Jim", description: "Meat stick", size: "Giant", flavor: "Original", category_id: "cat-jerky", price: 1.65, popularity: 65, max_quantity: 5, external: "dg-slimjim" }),
];

export const DEMO_SESSION: LunchRunSession = {
  id: "session-today",
  date: today,
  store_id: "store-dg",
  open_time: "07:00",
  cutoff_time: "11:30",
  delivery_window: "Lunch period",
  status: "open",
  max_orders: 20,
  created_at: thisMorning.toISOString(),
};

function makeItem(
  id: string,
  orderId: string,
  overrides: Partial<OrderItem> & Pick<OrderItem, "product_name" | "quantity" | "max_price">,
): OrderItem {
  return {
    id,
    order_id: orderId,
    product_id: null,
    is_custom: false,
    brand: null,
    size: null,
    flavor: null,
    description: null,
    estimated_price: null,
    min_estimated: null,
    max_estimated: null,
    actual_price: null,
    tax_amount: 0,
    substitution: "closest_under_max",
    substitution_notes: null,
    status: "pending",
    replacement_name: null,
    replacement_price: null,
    picked_up: false,
    image_url: null,
    ...overrides,
  };
}

const tylerItems: OrderItem[] = [
  makeItem("oi-t1", "ord-tyler", {
    product_id: "p-monster-ultra",
    product_name: "Monster Zero Ultra",
    brand: "Monster",
    size: "16 oz",
    flavor: "Zero Ultra",
    quantity: 1,
    estimated_price: 2.85,
    min_estimated: 2.5,
    max_estimated: 3.5,
    max_price: 3.5,
  }),
  makeItem("oi-t2", "ord-tyler", {
    product_id: "p-jack-teri",
    product_name: "Jack Link's Teriyaki Beef Jerky",
    brand: "Jack Link's",
    size: "3.25 oz",
    flavor: "Teriyaki",
    quantity: 1,
    estimated_price: 5.49,
    min_estimated: 4.5,
    max_estimated: 6.5,
    max_price: 6.0,
  }),
];

const emmaItems: OrderItem[] = [
  makeItem("oi-e1", "ord-emma", {
    product_id: "p-drpepper",
    product_name: "Dr Pepper",
    brand: "Dr Pepper",
    size: "20 oz",
    quantity: 1,
    estimated_price: 1.75,
    min_estimated: 1.5,
    max_estimated: 2.25,
    max_price: 2.25,
  }),
  makeItem("oi-e2", "ord-emma", {
    product_id: "p-takis",
    product_name: "Takis Fuego",
    brand: "Takis",
    size: "9.9 oz",
    flavor: "Fuego",
    quantity: 1,
    estimated_price: 3.25,
    min_estimated: 2.5,
    max_estimated: 4.0,
    max_price: 4.0,
  }),
  makeItem("oi-e3", "ord-emma", {
    product_id: "p-reeses",
    product_name: "Reese's Peanut Butter Cups",
    brand: "Reese's",
    size: "1.5 oz",
    quantity: 1,
    estimated_price: 1.45,
    min_estimated: 1.0,
    max_estimated: 2.0,
    max_price: 2.0,
  }),
];

const jakeItems: OrderItem[] = [
  makeItem("oi-j1", "ord-jake", {
    product_id: "p-redbull",
    product_name: "Red Bull Original",
    brand: "Red Bull",
    size: "8.4 oz",
    flavor: "Original",
    quantity: 2,
    estimated_price: 2.75,
    min_estimated: 2.25,
    max_estimated: 3.25,
    max_price: 3.25,
  }),
];

function orderBase(
  partial: Omit<Order, "updated_at" | "delivered_at" | "tax_amount" | "tip_amount" | "change_owed" | "amount_paid" | "merchandise_actual" | "final_total" | "delivery_location_other"> &
    Partial<Order>,
): Order {
  return {
    tip_amount: 0,
    tax_amount: 0,
    merchandise_actual: null,
    final_total: null,
    amount_paid: 0,
    change_owed: 0,
    delivery_location_other: null,
    delivered_at: null,
    updated_at: thisMorning.toISOString(),
    ...partial,
  };
}

export const DEMO_ORDERS: Order[] = [
  orderBase({
    id: "ord-tyler",
    order_code: "LR-1047",
    tracking_token: "demo-token-tyler-m-1047",
    session_id: "session-today",
    customer_name: "Tyler M.",
    delivery_location: "Cafeteria",
    payment_method: "Cash Prepay",
    notes: "Blue hoodie",
    status: "received",
    payment_status: "paid",
    merchandise_estimate_min: 8.0,
    merchandise_estimate_max: 10.0,
    service_fee: 1.5,
    estimated_total_min: 9.5,
    estimated_total_max: 11.5,
    max_authorized_total: 11.0,
    amount_paid: 12.0,
    created_at: new Date(thisMorning.getTime() + 30 * 60000).toISOString(),
    items: tylerItems,
  }),
  orderBase({
    id: "ord-emma",
    order_code: "LR-1048",
    tracking_token: "demo-token-emma-r-1048",
    session_id: "session-today",
    customer_name: "Emma R.",
    delivery_location: "Commons",
    payment_method: "Cash Prepay",
    notes: null,
    status: "received",
    payment_status: "unpaid",
    merchandise_estimate_min: 6.0,
    merchandise_estimate_max: 8.25,
    service_fee: 1.5,
    estimated_total_min: 7.5,
    estimated_total_max: 9.75,
    max_authorized_total: 9.75,
    created_at: new Date(thisMorning.getTime() + 45 * 60000).toISOString(),
    items: emmaItems,
  }),
  orderBase({
    id: "ord-jake",
    order_code: "LR-1049",
    tracking_token: "demo-token-jake-s-1049",
    session_id: "session-today",
    customer_name: "Jake S.",
    delivery_location: "Hallway",
    payment_method: "Cash Prepay",
    notes: null,
    status: "received",
    payment_status: "paid",
    merchandise_estimate_min: 4.5,
    merchandise_estimate_max: 6.5,
    service_fee: 1.5,
    estimated_total_min: 6.0,
    estimated_total_max: 8.0,
    max_authorized_total: 8.0,
    amount_paid: 8.0,
    created_at: new Date(thisMorning.getTime() + 60 * 60000).toISOString(),
    items: jakeItems,
  }),
];

export const DEMO_PRICE_HISTORY: PriceHistoryEntry[] = DEMO_PRODUCTS.map((p, i) => ({
  id: `ph-${i}`,
  product_id: p.id,
  old_price: p.current_price ? roundish(p.current_price - 0.1) : null,
  new_price: p.current_price ?? 0,
  store_id: p.store_id,
  source: "seed",
  created_at: thisMorning.toISOString(),
}));

function roundish(n: number) {
  return Math.round(n * 100) / 100;
}

export const DEMO_SETTINGS: AppSettings = { ...DEFAULT_SETTINGS };

export const DEMO_IMPORT_LOGS: PriceImportLog[] = [];
export const DEMO_PENDING_MATCHES: PendingProductMatch[] = [];
