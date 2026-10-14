-- Phase 6: admin capabilities. Apply after the Phase 5 migration.
alter type public.product_status add value if not exists 'draft';
alter type public.product_status add value if not exists 'published';
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.orders add column if not exists shipping_carrier text;
alter table public.orders add column if not exists tracking_number text;

create table if not exists public.store_settings (
  key text primary key check (key in ('homepage')),
  hero_image_path text,
  hero_alt_text text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);
alter table public.store_settings enable row level security;
create policy "public reads homepage settings" on public.store_settings for select using (key = 'homepage');
create policy "admins manage store settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads active products" on public.products;
create policy "public reads published products" on public.products for select using (is_active and status::text in ('preorder_open', 'published', 'sold_out'));
drop policy if exists "public reads images for active products" on public.product_images;
create policy "public reads images for published products" on public.product_images for select using (exists (select 1 from public.products where id = product_id and is_active and status::text in ('preorder_open', 'published', 'sold_out')));
drop policy if exists "public reads sizes for active products" on public.product_sizes;
create policy "public reads sizes for published products" on public.product_sizes for select using (exists (select 1 from public.products where id = product_id and is_active and status::text in ('preorder_open', 'published', 'sold_out')));

-- Administrators are assigned manually by a trusted project owner only:
-- update public.profiles set role = 'admin' where id = '<auth.users id>';
-- Registration always creates role = 'customer' through the Phase 5 trigger.
