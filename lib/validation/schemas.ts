import { z } from "zod";

export const substitutionSchema = z.enum([
  "closest_under_max",
  "any_flavor",
  "skip",
  "ask_me",
]);

export const cartItemSchema = z.object({
  productId: z.string().nullable(),
  isCustom: z.boolean(),
  name: z.string().min(1).max(120),
  brand: z.string().max(80).nullable(),
  size: z.string().max(40).nullable(),
  flavor: z.string().max(60).nullable(),
  description: z.string().max(400).nullable(),
  imageUrl: z.string().max(500).nullable().optional(),
  quantity: z.number().int().min(1).max(20),
  estimatedPrice: z.number().nullable(),
  minEstimated: z.number().nullable(),
  maxEstimated: z.number().nullable(),
  maxPrice: z.number().positive().max(100),
  substitution: substitutionSchema,
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2).max(60),
  deliveryLocation: z.string().min(1).max(80),
  deliveryLocationOther: z.string().max(120).optional().nullable(),
  paymentMethod: z.string().min(1).max(40),
  notes: z.string().max(400).optional().nullable(),
  tipAmount: z.number().min(0).max(20).default(0),
  items: z.array(cartItemSchema).min(1).max(20),
});

export const customItemSchema = z.object({
  name: z.string().min(2).max(120),
  brand: z.string().max(80).optional().nullable(),
  flavor: z.string().max(60).optional().nullable(),
  size: z.string().max(40).optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  maxPrice: z.number().positive().max(100),
  substitution: substitutionSchema.default("closest_under_max"),
});

export const priceImportItemSchema = z.object({
  externalId: z.string().optional(),
  name: z.string().min(1),
  brand: z.string().optional(),
  size: z.string().optional(),
  price: z.number().positive(),
  productUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  availability: z.boolean().optional(),
  store: z.string().optional(),
  locationId: z.string().optional(),
  lastChecked: z.string().optional(),
});

export const priceImportSchema = z.array(priceImportItemSchema).min(1).max(500);

export const productFormSchema = z.object({
  name: z.string().min(1).max(120),
  brand: z.string().max(80).optional().nullable(),
  description: z.string().max(400).optional().nullable(),
  size: z.string().max(40).optional().nullable(),
  flavor: z.string().max(60).optional().nullable(),
  category_id: z.string().min(1),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  store_id: z.string().optional().nullable(),
  current_price: z.coerce.number().positive().optional().nullable(),
  min_price: z.coerce.number().positive().optional().nullable(),
  max_price: z.coerce.number().positive().optional().nullable(),
  popularity: z.coerce.number().int().min(0).max(100).default(50),
  available: z.boolean().default(true),
  active: z.boolean().default(true),
  external_product_url: z.string().url().optional().nullable().or(z.literal("")),
  external_product_id: z.string().optional().nullable(),
  max_quantity: z.coerce.number().int().positive().optional().nullable(),
});

export const settingsSchema = z.object({
  service_fee: z.coerce.number().min(0).max(20),
  min_merchandise: z.coerce.number().min(0).max(50),
  max_merchandise: z.coerce.number().min(1).max(100),
  max_items_per_order: z.coerce.number().int().min(1).max(50),
  max_daily_orders: z.coerce.number().int().min(1).max(200),
  default_cutoff: z.string(),
  default_delivery_window: z.string(),
  tax_mode: z.enum(["simple", "receipt"]),
  tax_rate: z.coerce.number().min(0).max(0.3),
  active_store_id: z.string().nullable(),
  delivery_locations: z.array(z.string()),
  payment_methods: z.array(z.string()),
  allow_custom_requests: z.boolean(),
  allow_substitutions: z.boolean(),
  promo_fee: z.coerce.number().min(0).max(20).nullable(),
  promo_label: z.string().nullable(),
  promo_active: z.boolean(),
  test_mode: z.boolean().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
