-- Phase 5: product, customer, order, storage, and access-control foundation.
-- Apply through the Supabase SQL editor or Supabase CLI after reviewing it in your own project.

create extension if not exists pgcrypto;

create type public.product_status as enum ('preorder_open', 'sold_out', 'archived');
create type public.order_status as enum ('pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled');
create type public.profile_role as enum ('customer', 'admin');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  fit text not null check (fit in ('baggy', 'straight', 'wide-leg', 'bootcut')),
  fabric text not null default '',
  description text not null default '',
  price_in_paise integer not null check (price_in_paise >= 0),
  status public.product_status not null default 'preorder_open',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique check (char_length(storage_path) > 0),
  alt_text text not null default '',
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, sort_order)
);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null check (size ~ '^[0-9]{2}$'),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 2 and 120),
  role public.profile_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VNTG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'pending_payment',
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text check (customer_email is null or customer_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  customer_mobile text not null check (customer_mobile ~ '^[6-9][0-9]{9}$'),
  shipping_address jsonb not null check (
    jsonb_typeof(shipping_address) = 'object'
    and coalesce(length(shipping_address->>'address'), 0) >= 8
    and coalesce(length(shipping_address->>'city'), 0) >= 2
    and coalesce(length(shipping_address->>'state'), 0) >= 2
    and coalesce(shipping_address->>'pin', '') ~ '^[0-9]{6}$'
  ),
  subtotal_in_paise integer not null check (subtotal_in_paise >= 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_slug text not null,
  product_name text not null,
  size text not null check (size ~ '^[0-9]{2}$'),
  quantity smallint not null check (quantity between 1 and 10),
  unit_price_in_paise integer not null check (unit_price_in_paise >= 0),
  line_total_in_paise integer generated always as (quantity * unit_price_in_paise) stored,
  created_at timestamptz not null default now()
);

create index products_active_fit_idx on public.products (fit, slug) where is_active;
create index product_images_product_idx on public.product_images (product_id, sort_order);
create index product_sizes_available_idx on public.product_sizes (product_id, size) where available;
create index orders_user_created_idx on public.orders (user_id, created_at desc) where user_id is not null;
create index orders_status_created_idx on public.orders (status, created_at desc);
create index order_items_order_idx on public.order_items (order_id);

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_sizes_set_updated_at before update on public.product_sizes for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, nullif(trim(new.raw_user_meta_data->>'display_name'), '')) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "public reads active products" on public.products for select using (is_active);
create policy "public reads images for active products" on public.product_images for select using (exists (select 1 from public.products where id = product_id and is_active));
create policy "public reads sizes for active products" on public.product_sizes for select using (exists (select 1 from public.products where id = product_id and is_active));
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product sizes" on public.product_sizes for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read their profile" on public.profiles for select using (auth.uid() = id);
create policy "customers update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'customer');
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read their own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "customers read their own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_id and (orders.user_id = auth.uid() or public.is_admin())));

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
create policy "public reads product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admins manage product image storage" on storage.objects for all using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());

-- This is the only public write path for orders. It ignores client price and subtotal claims,
-- validates product/size availability from trusted tables, and always starts pending_payment.
create function public.create_pending_order(p_customer jsonb, p_items jsonb)
returns table (id uuid, order_number text, status public.order_status)
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_size public.product_sizes;
  v_quantity integer;
  v_subtotal integer := 0;
  v_count integer := 0;
  v_seen_item_keys text[] := array[]::text[];
  v_item_key text;
begin
  if jsonb_typeof(p_customer) <> 'object' or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then raise exception 'Invalid order request' using errcode = '22023'; end if;
  if coalesce(length(trim(p_customer->>'name')), 0) < 2 or coalesce(p_customer->>'mobile', '') !~ '^[6-9][0-9]{9}$' or coalesce(length(p_customer->>'address'), 0) < 8 or coalesce(length(p_customer->>'city'), 0) < 2 or coalesce(length(p_customer->>'state'), 0) < 2 or coalesce(p_customer->>'pin', '') !~ '^[0-9]{6}$' then raise exception 'Invalid customer details' using errcode = '22023'; end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_count := v_count + 1;
    if not (v_item ? 'product_id' and v_item ? 'size' and v_item ? 'quantity') or (v_item->>'quantity') !~ '^[0-9]+$' then raise exception 'Invalid cart item' using errcode = '22023'; end if;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 10 then raise exception 'Invalid item quantity' using errcode = '22023'; end if;
    v_item_key := (v_item->>'product_id') || ':' || (v_item->>'size');
    if v_item_key = any(v_seen_item_keys) then raise exception 'Duplicate cart item' using errcode = '22023'; end if;
    v_seen_item_keys := array_append(v_seen_item_keys, v_item_key);
    select * into v_product from public.products where products.id = (v_item->>'product_id')::uuid and is_active and status = 'preorder_open' for share;
    if not found then raise exception 'Product unavailable' using errcode = '22023'; end if;
    select * into v_size from public.product_sizes where product_sizes.product_id = v_product.id and product_sizes.size = v_item->>'size' and available for share;
    if not found then raise exception 'Size unavailable' using errcode = '22023'; end if;
    v_subtotal := v_subtotal + (v_product.price_in_paise * v_quantity);
  end loop;
  if v_count <> jsonb_array_length(p_items) then raise exception 'Invalid cart item count' using errcode = '22023'; end if;
  insert into public.orders (user_id, customer_name, customer_email, customer_mobile, shipping_address, subtotal_in_paise)
  values (auth.uid(), trim(p_customer->>'name'), nullif(lower(trim(p_customer->>'email')), ''), p_customer->>'mobile', jsonb_build_object('address', trim(p_customer->>'address'), 'city', trim(p_customer->>'city'), 'state', trim(p_customer->>'state'), 'pin', p_customer->>'pin'), v_subtotal)
  returning * into v_order;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where products.id = (v_item->>'product_id')::uuid;
    insert into public.order_items (order_id, product_id, product_slug, product_name, size, quantity, unit_price_in_paise)
    values (v_order.id, v_product.id, v_product.slug, v_product.name, v_item->>'size', v_quantity, v_product.price_in_paise);
  end loop;
  return query select v_order.id, v_order.order_number, v_order.status;
end;
$$;

revoke all on function public.create_pending_order(jsonb, jsonb) from public;
grant execute on function public.create_pending_order(jsonb, jsonb) to anon, authenticated;
