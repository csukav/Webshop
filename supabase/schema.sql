-- ================================================================
-- E-commerce webshop adatbázis séma (Supabase / PostgreSQL)
-- Futtatd le ezt a Supabase SQL Editor-ban!
-- ================================================================

-- Profiles tábla (a Supabase auth.users-hez kapcsolódik)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Automatikus profil létrehozás új felhasználó regisztrációkor
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Kategóriák tábla
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);
-- Oszlop hozzáadása ha még nem létezik (régebbi séma esetén)
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists created_at timestamptz default now();

-- Termékek tábla
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Oszlopok hozzáadása ha még nem léteznek
alter table public.products add column if not exists description text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.products add column if not exists updated_at timestamptz default now();

-- updated_at automatikus frissítése
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- Rendelések tábla
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled')),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  shipping_address text not null,
  created_at timestamptz default now()
);

-- Rendelés tételek tábla
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(10,2) not null check (price_at_purchase >= 0)
);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: felhasználó csak a sajátját látja; admin mindenkit
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- profiles_admin_select_all policy eltávolítva: végtelen rekurzió miatt
-- (a profiles táblán belüli policy nem kérdezhet a profiles táblára)
-- Az admin hozzáférés a service role kulcson keresztül történik.
drop policy if exists "profiles_admin_select_all" on public.profiles;

-- Kategóriák: bárki olvashatja; csak admin módosíthatja
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories
  for select using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Termékek: bárki olvashatja; csak admin módosíthatja
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Rendelések: felhasználó csak a sajátját; admin mindenkit
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ================================================================
-- Supabase Storage: "product-images" bucket létrehozása
-- ================================================================
-- Futtasd le a Supabase Storage felületen, VAGY az alábbi SQL-t:

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

drop policy if exists "product_images_select_all" on storage.objects;
create policy "product_images_select_all" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (
    bucket_id = 'product-images' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ================================================================
-- Minta adatok (opcionális)
-- ================================================================
insert into public.categories (name, slug, description) values
  ('Elektronika', 'elektronika', 'Elektronikus eszközök és kiegészítők'),
  ('Ruházat', 'ruhazat', 'Férfi és női ruházat'),
  ('Otthon & Kert', 'otthon-kert', 'Háztartási és kerti termékek');
