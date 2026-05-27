
-- ============== ENUMS ==============
create type public.app_role as enum ('viewer', 'creator', 'admin');
create type public.content_type as enum ('movie', 'series', 'anime');
create type public.content_status as enum ('draft', 'processing', 'ready', 'rejected');

-- ============== PROFILES ==============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Profils visibles publiquement"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Membre modifie son profil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Membre insère son profil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ============== USER ROLES ==============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Membre voit ses rôles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============== AUTO PROFILE + DEFAULT ROLE ==============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'viewer');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============== updated_at helper ==============
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============== CONTENT CATALOG ==============
create table public.content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type public.content_type not null,
  synopsis text,
  tagline text,
  year int,
  duration text,
  genres text[] not null default '{}',
  poster_url text,
  backdrop_url text,
  rating numeric(3,1),
  bunny_video_id text,
  status public.content_status not null default 'draft',
  uploader_id uuid references auth.users(id) on delete set null,
  view_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_status_idx on public.content (status);
create index content_type_idx on public.content (type);
create index content_uploader_idx on public.content (uploader_id);

grant select on public.content to anon, authenticated;
grant insert, update, delete on public.content to authenticated;
grant all on public.content to service_role;

alter table public.content enable row level security;

create policy "Contenus publiés visibles de tous"
  on public.content for select
  to anon, authenticated
  using (status = 'ready');

create policy "Auteur voit ses contenus"
  on public.content for select
  to authenticated
  using (auth.uid() = uploader_id);

create policy "Admin voit tout"
  on public.content for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Créateur publie ses contenus"
  on public.content for insert
  to authenticated
  with check (
    auth.uid() = uploader_id
    and (
      public.has_role(auth.uid(), 'creator')
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Auteur modifie ses contenus"
  on public.content for update
  to authenticated
  using (auth.uid() = uploader_id);

create policy "Admin modifie tout"
  on public.content for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Auteur supprime ses contenus"
  on public.content for delete
  to authenticated
  using (auth.uid() = uploader_id);

create policy "Admin supprime tout"
  on public.content for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger content_touch
  before update on public.content
  for each row execute function public.touch_updated_at();

-- ============== WATCHLIST ==============
create table public.watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.content(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

grant select, insert, delete on public.watchlist to authenticated;
grant all on public.watchlist to service_role;

alter table public.watchlist enable row level security;

create policy "Membre voit sa liste"
  on public.watchlist for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Membre ajoute à sa liste"
  on public.watchlist for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Membre retire de sa liste"
  on public.watchlist for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============== VIEWING HISTORY ==============
create table public.viewing_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.content(id) on delete cascade,
  progress_seconds int not null default 0,
  duration_seconds int,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index viewing_history_recent_idx
  on public.viewing_history (user_id, last_watched_at desc);

grant select, insert, update, delete on public.viewing_history to authenticated;
grant all on public.viewing_history to service_role;

alter table public.viewing_history enable row level security;

create policy "Membre voit son historique"
  on public.viewing_history for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Membre écrit son historique"
  on public.viewing_history for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Membre met à jour son historique"
  on public.viewing_history for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Membre efface son historique"
  on public.viewing_history for delete
  to authenticated
  using (auth.uid() = user_id);
