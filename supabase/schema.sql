-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Templates table
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  file_url text not null, -- Path in Supabase Storage
  preview_image_url text,
  fields_config jsonb not null default '[]'::jsonb, -- Array of field definitions
  price numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on templates
alter table public.templates enable row level security;

-- Policies for templates
create policy "Templates are viewable by everyone."
  on templates for select
  using ( true );

create policy "Only admins can insert templates."
  on templates for insert
  with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Only admins can update templates."
  on templates for update
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Only admins can delete templates."
  on templates for delete
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

-- Documents table (User generated documents)
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  template_id uuid references public.templates not null,
  data jsonb not null default '{}'::jsonb, -- User filled data
  status text default 'draft' check (status in ('draft', 'paid', 'completed')),
  payment_id text, -- Mercado Pago Payment ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on documents
alter table public.documents enable row level security;

-- Policies for documents
create policy "Users can view own documents."
  on documents for select
  using ( auth.uid() = user_id );

create policy "Users can insert own documents."
  on documents for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own documents."
  on documents for update
  using ( auth.uid() = user_id );

-- Storage Buckets Setup (You need to create these in the dashboard or via SQL if supported)
-- Bucket: templates (public: false, only admin download/upload, or public read for preview?)
-- Ideally templates are private, only accessible by system to generate doc.
-- But for now, let's assume we handle secure download via signed URLs.
