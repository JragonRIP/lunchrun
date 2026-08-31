-- Venmo, Cash App, and Stripe payment support

alter table public.settings
  add column if not exists venmo_username text,
  add column if not exists cashapp_cashtag text,
  add column if not exists stripe_enabled boolean not null default false;

alter table public.orders
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text;
