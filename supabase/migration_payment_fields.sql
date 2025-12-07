-- Add payment_id column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'documents' and column_name = 'payment_id') then
    alter table public.documents add column payment_id text;
  end if;
end $$;

-- Update status check constraint to include 'paid'
-- First, drop the existing constraint if we can find its name (usually documents_status_check)
-- Or just add a new one if we are sure.
-- Safer way: drop the constraint if exists and re-add it.
alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents add constraint documents_status_check check (status in ('draft', 'paid', 'completed'));
