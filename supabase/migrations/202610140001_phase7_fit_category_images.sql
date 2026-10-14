-- Phase 7: optional admin-managed homepage fit-category imagery.
-- Review and apply manually only after Phase 5 and Phase 6.
create table if not exists public.fit_category_images (
  fit text primary key check (fit in ('baggy', 'straight', 'wide-leg', 'bootcut')),
  storage_path text not null check (char_length(storage_path) > 0),
  alt_text text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);
alter table public.fit_category_images enable row level security;
create policy "public reads fit category images" on public.fit_category_images for select using (true);
create policy "admins manage fit category images" on public.fit_category_images for all using (public.is_admin()) with check (public.is_admin());
