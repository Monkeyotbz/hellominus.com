-- =============================================================================
-- 20260901120005_content.sql
-- Blog (categorías + posts) y testimonios / prueba social.
-- =============================================================================

-- =============================================================================
-- blog_categories
-- =============================================================================
create table public.blog_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.blog_categories enable row level security;
create policy "blog_categories_public_read" on public.blog_categories
  for select to anon, authenticated using (true);
create policy "blog_categories_staff_write" on public.blog_categories
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- blog_posts
-- =============================================================================
create table public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  slug_aliases     text[] not null default '{}',
  category_id      uuid references public.blog_categories(id) on delete set null,
  cover_image_path text,
  author_id        uuid references public.profiles(id) on delete set null,
  tags             text[] not null default '{}',
  reading_minutes  int,
  title            jsonb not null default '{}'::jsonb,
  excerpt          jsonb not null default '{}'::jsonb,
  body             jsonb not null default '{}'::jsonb,   -- Markdown por idioma
  meta_title       jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  featured         boolean not null default false,
  published_at     timestamptz,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index blog_posts_status_idx    on public.blog_posts (status);
create index blog_posts_published_idx on public.blog_posts (published_at desc);
create index blog_posts_category_idx  on public.blog_posts (category_id);
create index blog_posts_featured_idx  on public.blog_posts (featured) where featured;

create trigger trg_blog_posts_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
create policy "blog_posts_public_read" on public.blog_posts
  for select to anon, authenticated
  using ((status = 'published' and coalesce(published_at, now()) <= now()) or public.is_staff());
create policy "blog_posts_staff_write" on public.blog_posts
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- testimonials
-- =============================================================================
create table public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  author_name     text not null,
  author_location text,
  rating          int check (rating between 1 and 5),
  avatar_path     text,
  source          text check (source in ('google','whatsapp','instagram','facebook','tripadvisor','direct')),
  related_type    text check (related_type in ('accommodation','tour','event','real_estate','general')),
  related_id      uuid,
  quote           jsonb not null default '{}'::jsonb,
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  featured        boolean not null default false,
  sort_order      int not null default 0,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index testimonials_status_idx   on public.testimonials (status);
create index testimonials_featured_idx on public.testimonials (featured) where featured;

create trigger trg_testimonials_updated before update on public.testimonials
  for each row execute function public.set_updated_at();

select public._catalog_rls('testimonials');
