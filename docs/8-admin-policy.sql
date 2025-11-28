-- ==============================================================================
-- Admin Policy Update
-- Allow Admins and Presidents to update member records (e.g., changing roles)
-- ==============================================================================

-- Drop existing policy if it conflicts (though we only had "Users can update own profile")
-- We will create a new policy specifically for Admin/President updates

create policy "Admins and Presidents can update members" on public.members
  for update using (
    exists (
      select 1 from public.members
      where members.id = auth.uid()
      and members.role in ('ADMIN', 'PRESIDENT')
    )
  );

-- Verify the policy
select * from pg_policies where tablename = 'members';
