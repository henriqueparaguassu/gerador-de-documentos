-- Allow Admins to delete any document (to resolve FK constraints when deleting templates)
create policy "Admins can delete any document"
  on documents for delete
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

-- Allow Admins to view any document (useful for debugging/management)
create policy "Admins can view any document"
  on documents for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );
