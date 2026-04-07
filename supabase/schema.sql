create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'admin');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('active', 'paused', 'cancelled');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'coupon_type') then
    create type public.coupon_type as enum ('flat', 'percentage');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  address text,
  role public.user_role not null default 'customer',
  loyalty_points integer not null default 0,
  reward_streak integer not null default 0,
  goal_preference text,
  activity_level text,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text not null,
  image_url text not null,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  goal_tags text[] not null default '{}',
  stock integer not null default 0,
  rating numeric(3,2) not null default 0,
  featured boolean not null default false,
  plan_type text,
  subscription_discount integer,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  goal text not null,
  experience_level text,
  budget_tier text,
  image_url text not null,
  discount_percentage integer not null default 0 check (discount_percentage between 0 and 100),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.order_status not null default 'pending',
  shipping_address text,
  delivery_distance_km integer,
  delivery_zone text,
  subtotal numeric(10,2) not null default 0,
  taxes numeric(10,2) not null default 0,
  platform_fee numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  discount_total numeric(10,2) not null default 0,
  loyalty_points_redeemed integer not null default 0,
  loyalty_points_earned integer not null default 0,
  total numeric(10,2) not null default 0,
  currency text not null default 'INR',
  payment_provider text,
  payment_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  start_date date not null,
  status public.subscription_status not null default 'active',
  plan_type text not null,
  renewal_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, plan_type)
);

create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.coupon_type not null,
  value numeric(10,2) not null,
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  logged_on date not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, logged_on)
);

alter table public.profiles add column if not exists reward_streak integer not null default 0;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists address text;
alter table public.products add column if not exists subscription_discount integer;
alter table public.products add column if not exists tags text[] not null default '{}';
alter table public.bundles add column if not exists experience_level text;
alter table public.bundles add column if not exists budget_tier text;
alter table public.orders add column if not exists taxes numeric(10,2) not null default 0;
alter table public.orders add column if not exists platform_fee numeric(10,2) not null default 0;
alter table public.orders add column if not exists delivery_fee numeric(10,2) not null default 0;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists delivery_distance_km integer;
alter table public.orders add column if not exists delivery_zone text;
alter table public.orders add column if not exists currency text not null default 'INR';
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_id text;
alter table public.subscriptions add column if not exists renewal_price numeric(10,2) not null default 0;
alter table public.coupons add column if not exists expires_at timestamptz;
alter table public.coupons add column if not exists created_by uuid references public.profiles(id) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, terms_accepted_at)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url',
    case
      when coalesce((new.raw_user_meta_data->>'accepted_terms')::boolean, false) then now()
      else null
    end
  )
  on conflict (id) do update
  set display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.apply_loyalty_points(
  p_user_id uuid,
  p_points_earned integer,
  p_points_redeemed integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set loyalty_points = greatest(0, loyalty_points + p_points_earned - p_points_redeemed)
  where id = p_user_id;

  if p_points_earned <> 0 then
    insert into public.loyalty_points (user_id, points, reason)
    values (p_user_id, p_points_earned, 'Order reward');
  end if;

  if p_points_redeemed <> 0 then
    insert into public.loyalty_points (user_id, points, reason)
    values (p_user_id, -p_points_redeemed, 'Reward redemption');
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.bundles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;
alter table public.usage_logs enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "categories_public_read" on public.categories;
drop policy if exists "products_public_read" on public.products;
drop policy if exists "bundles_public_read" on public.bundles;
drop policy if exists "coupons_public_read" on public.coupons;
drop policy if exists "reviews_public_read" on public.reviews;
drop policy if exists "reviews_insert_authenticated" on public.reviews;
drop policy if exists "orders_select_own_or_admin" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "order_items_select_own_or_admin" on public.order_items;
drop policy if exists "order_items_insert_own" on public.order_items;
drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
drop policy if exists "subscriptions_insert_own" on public.subscriptions;
drop policy if exists "subscriptions_update_own_or_admin" on public.subscriptions;
drop policy if exists "loyalty_points_select_own_or_admin" on public.loyalty_points;
drop policy if exists "admin_manage_categories" on public.categories;
drop policy if exists "admin_manage_products" on public.products;
drop policy if exists "admin_manage_bundles" on public.bundles;
drop policy if exists "admin_manage_coupons" on public.coupons;
drop policy if exists "usage_logs_select_own_or_admin" on public.usage_logs;
drop policy if exists "usage_logs_insert_own" on public.usage_logs;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "categories_public_read" on public.categories
for select using (true);

create policy "products_public_read" on public.products
for select using (true);

create policy "bundles_public_read" on public.bundles
for select using (true);

create policy "coupons_public_read" on public.coupons
for select using (true);

create policy "reviews_public_read" on public.reviews
for select using (true);

create policy "reviews_insert_authenticated" on public.reviews
for insert with check (auth.uid() = user_id);

create policy "orders_select_own_or_admin" on public.orders
for select using (auth.uid() = user_id or public.is_admin());

create policy "orders_insert_own" on public.orders
for insert with check (auth.uid() = user_id);

create policy "order_items_select_own_or_admin" on public.order_items
for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
  )
);

create policy "order_items_insert_own" on public.order_items
for insert with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "subscriptions_select_own_or_admin" on public.subscriptions
for select using (auth.uid() = user_id or public.is_admin());

create policy "subscriptions_insert_own" on public.subscriptions
for insert with check (auth.uid() = user_id);

create policy "subscriptions_update_own_or_admin" on public.subscriptions
for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "loyalty_points_select_own_or_admin" on public.loyalty_points
for select using (auth.uid() = user_id or public.is_admin());

create policy "usage_logs_select_own_or_admin" on public.usage_logs
for select using (auth.uid() = user_id or public.is_admin());

create policy "usage_logs_insert_own" on public.usage_logs
for insert with check (auth.uid() = user_id);

create policy "admin_manage_categories" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_manage_products" on public.products
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_manage_bundles" on public.bundles
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_manage_coupons" on public.coupons
for all using (public.is_admin()) with check (public.is_admin());
