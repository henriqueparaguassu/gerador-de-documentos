-- Make file_url nullable in templates table
alter table public.templates alter column file_url drop not null;
