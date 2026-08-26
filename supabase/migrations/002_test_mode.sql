-- Test mode: admin can force ordering open past cutoff for end-to-end testing.
alter table public.settings
  add column if not exists test_mode boolean not null default false;
