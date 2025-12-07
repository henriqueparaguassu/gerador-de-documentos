-- Make user_id nullable
alter table public.documents alter column user_id drop not null;

-- Update RLS policies for documents
drop policy "Users can view own documents." on documents;
drop policy "Users can insert own documents." on documents;
drop policy "Users can update own documents." on documents;

create policy "Enable read access for all users"
  on documents for select
  using ( true );

create policy "Enable insert access for all users"
  on documents for insert
  with check ( true );

create policy "Enable update access for all users"
  on documents for update
  using ( true );
